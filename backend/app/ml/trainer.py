import lightgbm as lgb
import pandas as pd
import os
import joblib
from .feature_engineering import prepare_features, CATEGORICAL_FEATURES

def train_model(data_path: str, model_path: str) -> lgb.LGBMClassifier:
    """Train the LightGBM model and save it."""
    df = pd.read_csv(data_path)
    X = prepare_features(df)
    y = df['churn']
    
    model = lgb.LGBMClassifier(
        n_estimators=100,
        learning_rate=0.1,
        random_state=42
    )
    
    model.fit(X, y, categorical_feature=CATEGORICAL_FEATURES)
    
    dir_name = os.path.dirname(model_path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    joblib.dump(model, model_path)
    return model
