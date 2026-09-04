import shap
import pandas as pd
import numpy as np
from typing import Dict, Any, List
from .model_manager import model_manager
from .feature_engineering import prepare_single

class ShapExplainer:
    def __init__(self):
        self.explainer = None
        
    def get_explainer(self):
        if self.explainer is None:
            model = model_manager.get_model()
            # LightGBM classifier provides a booster object
            self.explainer = shap.TreeExplainer(model.booster_)
        return self.explainer
        
    def explain(self, features_dict: Dict[str, Any]) -> List[Dict[str, Any]]:
        explainer = self.get_explainer()
        X = prepare_single(features_dict)
        
        shap_values = explainer.shap_values(X)
        
        # Depending on LightGBM version/objective, shap_values might be a list or array
        if isinstance(shap_values, list):
            vals = shap_values[1][0] # class 1
        else:
            vals = shap_values[0]
            
        base_value = explainer.expected_value
        if isinstance(base_value, list) or isinstance(base_value, np.ndarray):
            base_value = base_value[1]
            
        explanations = []
        for i, col in enumerate(X.columns):
            explanations.append({
                "feature": col,
                "value": float(X.iloc[0, i]),
                "contribution": float(vals[i])
            })
            
        # Sort by absolute contribution
        explanations.sort(key=lambda x: abs(x["contribution"]), reverse=True)
        return explanations
