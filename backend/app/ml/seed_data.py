import pandas as pd
import numpy as np
import os
import uuid

def generate_seed_data(num_rows: int = 3000) -> pd.DataFrame:
    np.random.seed(42)
    
    total_orders = np.clip(np.random.poisson(8, num_rows) + 1, 1, 50)
    avg_order_value = np.clip(np.random.lognormal(3.5, 0.8, num_rows), 10, 500)
    days_since_last_purchase = np.clip(np.random.exponential(60, num_rows), 0, 365)
    cart_abandon_count = np.clip(np.random.poisson(2, num_rows), 0, 15)
    return_rate = np.clip(np.random.beta(2, 8, num_rows), 0.0, 1.0)
    discount_usage_rate = np.clip(np.random.beta(3, 5, num_rows), 0.0, 1.0)
    tenure_days = np.random.uniform(1, 1825, num_rows).astype(int)
    
    product_categories = ["Electronics", "Fashion", "Home & Garden", "Sports", "Books", "Beauty"]
    product_category = np.random.choice(product_categories, num_rows)
    
    channels = ["Organic", "Paid Search", "Social Media", "Email", "Referral"]
    acquisition_channel = np.random.choice(channels, num_rows)
    
    customer_ids = [str(uuid.uuid4()) for _ in range(num_rows)]
    
    z = (
        (days_since_last_purchase / 365.0) * 2.0 +
        return_rate * 1.5 +
        (cart_abandon_count / 15.0) * 1.0 -
        (total_orders / 50.0) * 2.0 -
        (tenure_days / 1825.0) * 1.5
    )
    
    # Sigmoid
    prob = 1 / (1 + np.exp(-z))
    
    # Adjust threshold to get ~20% churn
    threshold = np.percentile(prob, 80)
    churn = (prob > threshold).astype(int)
    
    df = pd.DataFrame({
        "customer_id": customer_ids,
        "total_orders": total_orders,
        "avg_order_value": avg_order_value,
        "days_since_last_purchase": days_since_last_purchase,
        "cart_abandon_count": cart_abandon_count,
        "return_rate": return_rate,
        "discount_usage_rate": discount_usage_rate,
        "tenure_days": tenure_days,
        "product_category": product_category,
        "acquisition_channel": acquisition_channel,
        "churn": churn
    })
    
    return df

def save_seed_data(filepath: str, num_rows: int = 3000) -> None:
    df = generate_seed_data(num_rows)
    dir_name = os.path.dirname(filepath)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    df.to_csv(filepath, index=False)
