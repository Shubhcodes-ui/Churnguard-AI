import random
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.customer import Customer
from app.ml.model_manager import model_manager

router = APIRouter()

EVENTS = [
    {"type": "new_order", "weight": 0.35},
    {"type": "cart_abandon", "weight": 0.30},
    {"type": "return", "weight": 0.20},
    {"type": "price_increase", "weight": 0.15},
]


@router.post("/")
def simulate_live_activity(db: Session = Depends(get_db)):
    count = db.query(Customer).count()
    if count == 0:
        raise HTTPException(status_code=400, detail="No customers to simulate")

    offset = random.randint(0, count - 1)
    customer = db.query(Customer).offset(offset).first()
    old_prob = customer.churn_probability or 0.0

    rand = random.random()
    cumulative = 0.0
    event_type = EVENTS[-1]["type"]
    for evt in EVENTS:
        cumulative += evt["weight"]
        if rand <= cumulative:
            event_type = evt["type"]
            break

    details = ""
    if event_type == "new_order":
        customer.total_orders += 1
        customer.days_since_last_purchase = 0
        details = f"Customer placed a new order (total: {customer.total_orders})."
    elif event_type == "cart_abandon":
        customer.cart_abandon_count += 1
        details = f"Customer abandoned cart (count: {customer.cart_abandon_count})."
    elif event_type == "return":
        customer.return_rate = min(1.0, customer.return_rate + 0.08)
        details = f"Customer returned an item (rate: {customer.return_rate:.2f})."
    elif event_type == "price_increase":
        customer.discount_usage_rate = max(0.0, customer.discount_usage_rate - 0.15)
        details = f"Price increase reduced discount usage to {customer.discount_usage_rate:.2f}."

    features = {
        "total_orders": customer.total_orders,
        "avg_order_value": customer.avg_order_value,
        "days_since_last_purchase": customer.days_since_last_purchase,
        "cart_abandon_count": customer.cart_abandon_count,
        "product_category": customer.product_category or "Electronics",
        "return_rate": customer.return_rate,
        "discount_usage_rate": customer.discount_usage_rate,
        "acquisition_channel": customer.acquisition_channel or "Organic",
        "tenure_days": customer.tenure_days,
    }
    new_prob = model_manager.predict(features)
    customer.churn_probability = new_prob
    db.commit()

    change = new_prob - old_prob
    return {
        "event_type": event_type,
        "customer_ext_id": customer.customer_ext_id,
        "old_probability": round(old_prob, 4),
        "new_probability": round(new_prob, 4),
        "change": round(change, 4),
        "details": details,
    }
