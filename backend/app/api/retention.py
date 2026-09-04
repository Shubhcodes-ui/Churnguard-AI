from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.retention_service import get_offers, create_offer, get_stats, generate_suggestions
from pydantic import BaseModel
from typing import List

router = APIRouter()

class OfferCreate(BaseModel):
    customer_id: int
    offer_type: str
    discount_pct: float

@router.get("/")
def list_offers(skip: int = Query(0, ge=0), limit: int = Query(100, le=1000), db: Session = Depends(get_db)):
    actions = get_offers(db, skip=skip, limit=limit)
    return actions

@router.post("/")
def create_new_offer(offer: OfferCreate, db: Session = Depends(get_db)):
    action = create_offer(
        db=db,
        customer_id=offer.customer_id,
        offer_type=offer.offer_type,
        discount_pct=offer.discount_pct
    )
    return {"message": "Offer created successfully", "action_id": action.id}

@router.get("/stats")
def retention_stats(db: Session = Depends(get_db)):
    stats = get_stats(db)
    return stats

@router.get("/suggestions")
def retention_suggestions(db: Session = Depends(get_db)):
    suggestions = generate_suggestions(db)
    return suggestions
