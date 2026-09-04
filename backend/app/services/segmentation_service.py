import pandas as pd
from sqlalchemy.orm import Session
from app.models.customer import Customer
from app.schemas.schemas import SegmentSummary

def compute_segments(db: Session):
    customers = db.query(Customer).all()
    if not customers:
        return 0
        
    data = []
    for c in customers:
        data.append({
            "id": c.id,
            "R": c.days_since_last_purchase,
            "F": c.total_orders,
            "M": c.avg_order_value * c.total_orders,
            "tenure_days": c.tenure_days
        })
        
    df = pd.DataFrame(data)
    
    # Compute RFM quartiles
    # For R (days since last purchase), lower is better (higher score).
    try:
        df["r_quartile"] = pd.qcut(df["R"], 4, labels=[4, 3, 2, 1], duplicates="drop").astype(int)
    except ValueError:
        df["r_quartile"] = 1
        
    try:
        df["f_quartile"] = pd.qcut(df["F"], 4, labels=[1, 2, 3, 4], duplicates="drop").astype(int)
    except ValueError:
        df["f_quartile"] = 1
        
    try:
        df["m_quartile"] = pd.qcut(df["M"], 4, labels=[1, 2, 3, 4], duplicates="drop").astype(int)
    except ValueError:
        df["m_quartile"] = 1
        
    updated_count = 0
    for idx, row in df.iterrows():
        customer = db.query(Customer).filter(Customer.id == row["id"]).first()
        if not customer:
            continue
            
        r, f, m = row["r_quartile"], row["f_quartile"], row["m_quartile"]
        
        if r >= 3 and f >= 3 and m >= 3:
            segment = "high_value"
        elif f >= 3 and row["tenure_days"] > 365:
            segment = "loyal"
        elif r <= 2 and (f >= 2 or m >= 2):
            segment = "at_risk"
        elif r <= 1 and f <= 2:
            segment = "dormant"
        else:
            segment = "regular"
            
        if customer.segment != segment:
            customer.segment = segment
            updated_count += 1
            
    db.commit()
    return updated_count

def get_segment_summary(db: Session):
    customers = db.query(Customer).all()
    total_customers = len(customers)
    if total_customers == 0:
        return []
        
    segments = {}
    for c in customers:
        seg = c.segment or "regular"
        if seg not in segments:
            segments[seg] = {"count": 0, "sum_prob": 0.0, "sum_clv": 0.0}
        segments[seg]["count"] += 1
        segments[seg]["sum_prob"] += c.churn_probability if c.churn_probability is not None else 0.0
        segments[seg]["sum_clv"] += c.clv if c.clv is not None else 0.0
        
    results = []
    for seg, data in segments.items():
        count = data["count"]
        results.append(SegmentSummary(
            name=seg,
            count=count,
            avg_churn_probability=data["sum_prob"] / count if count > 0 else 0,
            total_clv=data["sum_clv"],
            percentage=round(count / total_customers * 100, 2)
        ))
        
    return results
