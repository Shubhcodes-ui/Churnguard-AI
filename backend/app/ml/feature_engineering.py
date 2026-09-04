import pandas as pd
import numpy as np

NUMERIC_FEATURES = [
    "total_orders",
    "avg_order_value",
    "days_since_last_purchase",
    "cart_abandon_count",
    "return_rate",
    "discount_usage_rate",
    "tenure_days"
]

CATEGORICAL_FEATURES = [
    "product_category",
    "acquisition_channel"
]

CATEGORY_MAPPINGS = {
    "product_category": {
        "Electronics": 0,
        "Fashion": 1,
        "Home & Garden": 2,
        "Sports": 3,
        "Books": 4,
        "Beauty": 5
    },
    "acquisition_channel": {
        "Organic": 0,
        "Paid Search": 1,
        "Social Media": 2,
        "Email": 3,
        "Referral": 4
    }
}

def prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    """Prepare features for model training/prediction."""
    X = df.copy()
    
    for cat_col, mapping in CATEGORY_MAPPINGS.items():
        if cat_col in X.columns:
            X[cat_col] = X[cat_col].map(mapping).fillna(-1).astype(int)
            
    # Ensure all required features are present
    features = NUMERIC_FEATURES + CATEGORICAL_FEATURES
    for f in features:
        if f not in X.columns:
            X[f] = 0
            
    return X[features]

def prepare_single(data: dict) -> pd.DataFrame:
    """Prepare a single instance for prediction."""
    df = pd.DataFrame([data])
    return prepare_features(df)
