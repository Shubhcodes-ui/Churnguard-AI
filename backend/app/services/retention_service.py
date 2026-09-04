import statistics
from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.models.retention_action import RetentionAction
from app.schemas.schemas import RetentionSuggestion

def generate_suggestions(db: Session):
    customers = db.query(Customer).filter(
        Customer.segment.in_(["at_risk", "dormant", "high_value", "loyal"])
    ).all()

    clv_values = [c.clv for c in customers if c.clv is not None and c.clv > 0]
    median_clv = statistics.median(clv_values) if clv_values else 0

    suggestions = []
    for c in customers:
        offer_type = None
        discount_pct = 0.0

        if c.segment == "high_value" and c.churn_probability and c.churn_probability > 0.3:
            offer_type = "Premium Recovery Package"
            discount_pct = 25.0
        elif c.segment == "at_risk" and c.clv and c.clv > median_clv:
            offer_type = "Loyalty Reward"
            discount_pct = 15.0
        elif c.segment == "at_risk":
            offer_type = "Come Back Offer"
            discount_pct = 10.0
        elif c.segment == "dormant":
            offer_type = "Win-Back Special"
            discount_pct = 30.0
        elif c.segment == "loyal":
            offer_type = "Thank You Reward"
            discount_pct = 5.0

        if offer_type:
            suggestions.append(RetentionSuggestion(
                customer_id=c.id,
                customer_ext_id=c.customer_ext_id,
                segment=c.segment or "regular",
                churn_probability=c.churn_probability or 0.0,
                clv=c.clv or 0.0,
                offer_type=offer_type,
                discount_pct=discount_pct,
                estimated_savings=(c.clv or 0.0) * (c.churn_probability or 0.0),
            ))

    return suggestions


def create_offer(db: Session, customer_id: int, offer_type: str, discount_pct: float):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    estimated_value = (customer.clv or 0.0) * (discount_pct / 100.0) if customer else 0.0

    action = RetentionAction(
        customer_id=customer_id,
        offer_type=offer_type,
        discount_pct=discount_pct,
        estimated_value=estimated_value,
        status="sent",
    )
    db.add(action)
    db.commit()
    db.refresh(action)
    return action


def get_stats(db: Session):
    actions = db.query(RetentionAction).all()
    stats = {"total": len(actions), "pending": 0, "sent": 0, "accepted": 0, "declined": 0}
    for a in actions:
        if a.status in stats:
            stats[a.status] += 1
    return stats


def get_offers(db: Session, skip: int = 0, limit: int = 100):
    actions = db.query(RetentionAction).order_by(RetentionAction.created_at.desc()).offset(skip).limit(limit).all()
    results = []
    for a in actions:
        customer = db.query(Customer).filter(Customer.id == a.customer_id).first()
        results.append({
            "id": a.id,
            "customer_id": a.customer_id,
            "customer_ext_id": customer.customer_ext_id if customer else "unknown",
            "offer_type": a.offer_type,
            "discount_pct": a.discount_pct,
            "estimated_value": a.estimated_value,
            "status": a.status,
            "created_at": str(a.created_at) if a.created_at else None,
        })
    return results
