from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.sql import func
from app.database import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    model_version_id = Column(Integer, ForeignKey("model_versions.id"), nullable=True)
    probability = Column(Float, nullable=False)
    is_churn = Column(Boolean, nullable=False)
    shap_top3 = Column(Text, nullable=True)
    predicted_at = Column(DateTime(timezone=True), server_default=func.now())
