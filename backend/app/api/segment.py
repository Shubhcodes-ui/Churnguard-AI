from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.customer import Customer
from app.schemas.schemas import CustomerResponse
from app.services.segmentation_service import compute_segments, get_segment_summary

router = APIRouter()

@router.get("/")
def get_segments(db: Session = Depends(get_db)):
    segments = get_segment_summary(db)
    total = db.query(Customer).count()
    return {
        "segments": segments,
        "total_customers": total
    }

@router.post("/compute")
def trigger_segment_computation(db: Session = Depends(get_db)):
    updated = compute_segments(db)
    return {"message": "Segmentation completed successfully", "segments_updated": updated}

@router.get("/{segment_name}/customers")
def get_segment_customers(
    segment_name: str,
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    query = db.query(Customer).filter(Customer.segment == segment_name)
    total = query.count()
    
    skip = (page - 1) * page_size
    customers = query.offset(skip).limit(page_size).all()
    
    items = [CustomerResponse.model_validate(c) for c in customers]
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size
    }
