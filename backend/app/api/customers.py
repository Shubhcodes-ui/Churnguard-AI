import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from typing import Optional
from app.database import get_db
from app.models.customer import Customer
from app.models.prediction import Prediction
from app.schemas.schemas import CustomerCreate, CustomerResponse, PaginatedCustomerResponse
from app.services.prediction_service import predict_single

router = APIRouter()


@router.get("/", response_model=PaginatedCustomerResponse)
def get_customers(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    segment: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = Query("churn_probability"),
    sort_order: str = Query("desc"),
):
    query = db.query(Customer)

    if segment:
        query = query.filter(Customer.segment == segment)

    if search:
        query = query.filter(
            or_(
                Customer.customer_ext_id.ilike(f"%{search}%"),
                Customer.product_category.ilike(f"%{search}%"),
                Customer.acquisition_channel.ilike(f"%{search}%"),
            )
        )

    if hasattr(Customer, sort_by):
        sort_col = getattr(Customer, sort_by)
        query = query.order_by(desc(sort_col) if sort_order == "desc" else asc(sort_col))

    total = query.count()
    skip = (page - 1) * page_size
    customers = query.offset(skip).limit(page_size).all()

    items = [CustomerResponse.model_validate(c) for c in customers]
    return PaginatedCustomerResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/{customer_id}")
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    result = CustomerResponse.model_validate(customer).model_dump()

    prediction = (
        db.query(Prediction)
        .filter(Prediction.customer_id == customer.id)
        .order_by(desc(Prediction.predicted_at))
        .first()
    )
    if prediction and prediction.shap_top3:
        try:
            result["shap_values"] = json.loads(prediction.shap_top3)
        except (json.JSONDecodeError, TypeError):
            result["shap_values"] = []
    else:
        result["shap_values"] = []

    return result


@router.post("/")
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    data = customer.model_dump()
    result = predict_single(db, data)
    return result


@router.delete("/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(customer)
    db.commit()
    return {"message": "Customer deleted"}
