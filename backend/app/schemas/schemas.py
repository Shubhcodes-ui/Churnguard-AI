from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class PredictRequest(BaseModel):
    total_orders: int
    avg_order_value: float
    days_since_last_purchase: int
    cart_abandon_count: int
    product_category: str
    return_rate: float
    discount_usage_rate: float
    acquisition_channel: str
    tenure_days: int

class PredictResponse(BaseModel):
    customer_id: Optional[str] = None
    probability: float
    is_churn: bool
    risk_level: str
    segment: str
    clv: float
    shap_top3: List[dict]
    model_config = ConfigDict(from_attributes=True)

class DashboardMetrics(BaseModel):
    total_customers: int
    churn_rate: float
    revenue_at_risk: float
    avg_clv: float
    customers_at_risk: int
    segment_breakdown: List[dict]
    model_config = ConfigDict(from_attributes=True)

class SegmentSummary(BaseModel):
    name: str
    count: int
    avg_churn_probability: float
    total_clv: float
    percentage: float
    model_config = ConfigDict(from_attributes=True)

class ChurnTrend(BaseModel):
    month: str
    churn_rate: float
    churned_count: int
    total_count: int
    model_config = ConfigDict(from_attributes=True)

class SimulateResponse(BaseModel):
    event_type: str
    customer_ext_id: str
    old_probability: Optional[float] = None
    new_probability: float
    change: float
    details: str
    model_config = ConfigDict(from_attributes=True)

class RetentionSuggestion(BaseModel):
    customer_id: int
    customer_ext_id: str
    segment: str
    churn_probability: float
    clv: float
    offer_type: str
    discount_pct: float
    estimated_savings: float
    model_config = ConfigDict(from_attributes=True)

class CustomerCreate(BaseModel):
    customer_ext_id: str
    total_orders: int
    avg_order_value: float
    days_since_last_purchase: int
    cart_abandon_count: int
    product_category: str
    return_rate: float
    discount_usage_rate: float
    acquisition_channel: str
    tenure_days: int

class CustomerResponse(BaseModel):
    id: int
    customer_ext_id: str
    total_orders: float = 0
    avg_order_value: float = 0.0
    days_since_last_purchase: float = 0
    cart_abandon_count: float = 0
    product_category: Optional[str] = None
    return_rate: float = 0.0
    discount_usage_rate: float = 0.0
    acquisition_channel: Optional[str] = None
    tenure_days: float = 0
    churn_probability: Optional[float] = None
    churn_label: Optional[int] = None
    segment: Optional[str] = None
    clv: Optional[float] = None
    model_config = ConfigDict(from_attributes=True)

class PaginatedCustomerResponse(BaseModel):
    items: List[CustomerResponse]
    total: int
    page: int
    page_size: int
    model_config = ConfigDict(from_attributes=True)

class RefreshRequest(BaseModel):
    refresh_token: str
