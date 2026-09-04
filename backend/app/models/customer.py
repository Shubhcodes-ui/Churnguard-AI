from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, default=1)
    customer_ext_id = Column(String, index=True, nullable=False)
    total_orders = Column(Integer, default=0)
    avg_order_value = Column(Float, default=0.0)
    days_since_last_purchase = Column(Integer, default=0)
    cart_abandon_count = Column(Integer, default=0)
    product_category = Column(String)
    return_rate = Column(Float, default=0.0)
    discount_usage_rate = Column(Float, default=0.0)
    acquisition_channel = Column(String)
    tenure_days = Column(Integer, default=0)
    
    churn_label = Column(Integer, nullable=True)
    churn_probability = Column(Float, nullable=True)
    segment = Column(String, nullable=True)
    clv = Column(Float, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
