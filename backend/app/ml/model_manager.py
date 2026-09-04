import os
import joblib
import pandas as pd
from typing import Dict, Any
from .trainer import train_model
from .feature_engineering import prepare_single

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "model.joblib")
DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "seed_data.csv")

class ModelManager:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelManager, cls).__new__(cls)
            cls._instance.model = None
        return cls._instance
        
    def load_or_train(self) -> None:
        """Load the model if it exists, otherwise train it."""
        if os.path.exists(MODEL_PATH):
            self.model = joblib.load(MODEL_PATH)
        else:
            if not os.path.exists(DATA_PATH):
                from .seed_data import save_seed_data
                save_seed_data(DATA_PATH, 3000)
            self.model = train_model(DATA_PATH, MODEL_PATH)
            
    def get_model(self):
        if self.model is None:
            self.load_or_train()
        return self.model
        
    def predict(self, features_dict: Dict[str, Any]) -> float:
        model = self.get_model()
        X = prepare_single(features_dict)
        # Returns probability of class 1 (churn)
        proba = model.predict_proba(X)[0][1]
        return float(proba)

model_manager = ModelManager()
