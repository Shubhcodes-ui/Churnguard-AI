import json
import uuid
from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.models.prediction import Prediction
from app.ml.model_manager import model_manager
from app.ml.explainer import ShapExplainer

explainer = ShapExplainer()

def predict_single(db: Session, data: dict) -> dict:
    """Predict churn for a single customer, save to DB, return result."""
    tenure_days = data.get("tenure_days", 0)
    avg_order_value = data.get("avg_order_value", 0.0)
    total_orders = data.get("total_orders", 0)

    # CLV calculation
    if tenure_days > 0:
        clv = avg_order_value * total_orders * (tenure_days / 365.0)
    else:
        clv = avg_order_value * total_orders

    # Run model prediction
    features = {
        "total_orders": total_orders,
        "avg_order_value": avg_order_value,
        "days_since_last_purchase": data.get("days_since_last_purchase", 0),
        "cart_abandon_count": data.get("cart_abandon_count", 0),
        "product_category": data.get("product_category", "Electronics"),
        "return_rate": data.get("return_rate", 0.0),
        "discount_usage_rate": data.get("discount_usage_rate", 0.0),
        "acquisition_channel": data.get("acquisition_channel", "Organic"),
        "tenure_days": tenure_days,
    }
    prob = model_manager.predict(features)
    is_churn = prob > 0.5

    # SHAP explanations
    try:
        explanations = explainer.explain(features)
        shap_top3 = sorted(explanations, key=lambda x: abs(x.get("contribution", 0)), reverse=True)[:3]
    except Exception:
        shap_top3 = []

    # Risk level
    if prob > 0.7:
        risk_level = "Critical"
    elif prob > 0.5:
        risk_level = "High"
    elif prob > 0.3:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    # Save/update Customer
    customer_ext_id = data.get("customer_ext_id") or data.get("customer_id") or f"CUST-{uuid.uuid4().hex[:8]}"
    
    existing = db.query(Customer).filter(Customer.customer_ext_id == customer_ext_id).first()
    if existing:
        existing.total_orders = total_orders
        existing.avg_order_value = avg_order_value
        existing.days_since_last_purchase = data.get("days_since_last_purchase", 0)
        existing.cart_abandon_count = data.get("cart_abandon_count", 0)
        existing.product_category = data.get("product_category", "Electronics")
        existing.return_rate = data.get("return_rate", 0.0)
        existing.discount_usage_rate = data.get("discount_usage_rate", 0.0)
        existing.acquisition_channel = data.get("acquisition_channel", "Organic")
        existing.tenure_days = tenure_days
        existing.churn_probability = prob
        existing.churn_label = int(is_churn)
        existing.clv = clv
        db.commit()
        customer = existing
    else:
        customer = Customer(
            customer_ext_id=customer_ext_id,
            total_orders=total_orders,
            avg_order_value=avg_order_value,
            days_since_last_purchase=data.get("days_since_last_purchase", 0),
            cart_abandon_count=data.get("cart_abandon_count", 0),
            product_category=data.get("product_category", "Electronics"),
            return_rate=data.get("return_rate", 0.0),
            discount_usage_rate=data.get("discount_usage_rate", 0.0),
            acquisition_channel=data.get("acquisition_channel", "Organic"),
            tenure_days=tenure_days,
            churn_probability=prob,
            churn_label=int(is_churn),
            clv=clv,
            segment="regular",
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)

    # Save Prediction
    prediction = Prediction(
        customer_id=customer.id,
        probability=prob,
        is_churn=is_churn,
        shap_top3=json.dumps(shap_top3),
    )
    db.add(prediction)
    db.commit()

    return {
        "customer_id": customer.customer_ext_id,
        "probability": round(prob, 4),
        "is_churn": is_churn,
        "risk_level": risk_level,
        "segment": customer.segment or "regular",
        "clv": round(clv, 2),
        "shap_top3": shap_top3,
    }
