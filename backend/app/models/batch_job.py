from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.database import Base

class BatchJob(Base):
    __tablename__ = "batch_jobs"

    id = Column(Integer, primary_key=True, index=True)
    status = Column(String, nullable=False, default="pending")
    total_rows = Column(Integer, default=0)
    processed_rows = Column(Integer, default=0)
    file_path = Column(String, nullable=False)
    error_message = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
