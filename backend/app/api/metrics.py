from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.customer import Customer
from app.schemas.schemas import DashboardMetrics, ChurnTrend
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/dashboard", response_model=DashboardMetrics)
def get_dashboard(db: Session = Depends(get_db)):
    total_customers = db.query(Customer).count()
    if total_customers == 0:
        return DashboardMetrics(
            total_customers=0,
            churn_rate=0.0,
            revenue_at_risk=0.0,
            avg_clv=0.0,
            customers_at_risk=0,
            segment_breakdown=[]
        )
        
    avg_churn_prob = db.query(func.avg(Customer.churn_probability)).filter(Customer.churn_probability.isnot(None)).scalar() or 0.0
    churn_rate = avg_churn_prob * 100
    
    customers_at_risk_count = db.query(Customer).filter(Customer.churn_probability > 0.5).count()
    
    # Revenue at risk: sum(churn_prob * clv)
    risk_customers = db.query(Customer).filter(Customer.churn_probability.isnot(None), Customer.clv.isnot(None)).all()
    revenue_at_risk = sum(c.churn_probability * c.clv for c in risk_customers)
    
    avg_clv = db.query(func.avg(Customer.clv)).filter(Customer.clv.isnot(None)).scalar() or 0.0
    
    # Segment breakdown
    segments_query = db.query(Customer.segment, func.count(Customer.id)).group_by(Customer.segment).all()
    segment_breakdown = [{"name": s[0] or "unknown", "value": s[1]} for s in segments_query]
    
    return DashboardMetrics(
        total_customers=total_customers,
        churn_rate=churn_rate,
        revenue_at_risk=revenue_at_risk,
        avg_clv=avg_clv,
        customers_at_risk=customers_at_risk_count,
        segment_breakdown=segment_breakdown
    )

@router.get("/trends")
def get_trends(db: Session = Depends(get_db)):
    # Generate synthetic monthly data for the last 6 months based on current DB state
    current_date = datetime.now()
    trends = []
    
    total_customers = db.query(Customer).count()
    churn_rate_base = db.query(func.avg(Customer.churn_probability)).filter(Customer.churn_probability.isnot(None)).scalar() or 0.0
    
    # Fake some historical variance
    variances = [0.05, 0.02, -0.03, -0.01, 0.04, 0.0]
    
    for i in range(6, 0, -1):
        month_date = current_date - timedelta(days=30 * i)
        month_str = month_date.strftime("%b")
        
        var = variances[i-1]
        hist_churn_rate = max(0.01, min(0.99, churn_rate_base + var))
        hist_total = max(10, total_customers - (i * 15))
        hist_churned = int(hist_total * hist_churn_rate)
        
        trends.append(ChurnTrend(
            month=month_str,
            churn_rate=hist_churn_rate * 100,
            churned_count=hist_churned,
            total_count=hist_total
        ))
        
    return trends
