import os
import pandas as pd
from sqlalchemy.orm import Session
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from app.models.customer import Customer
from app.models.model_version import ModelVersion
from app.ml.trainer import train_model
from app.ml.model_manager import model_manager
from app.ml.feature_engineering import prepare_features

def retrain_model(db: Session):
    """Retrain the model on the latest customer data."""
    customers = db.query(Customer).filter(Customer.churn_label.isnot(None)).all()
    if len(customers) < 10:
        raise ValueError("Not enough labeled customers for training (need at least 10).")

    data = []
    for c in customers:
        data.append({
            "total_orders": c.total_orders,
            "avg_order_value": c.avg_order_value,
            "days_since_last_purchase": c.days_since_last_purchase,
            "cart_abandon_count": c.cart_abandon_count,
            "product_category": c.product_category or "Electronics",
            "return_rate": c.return_rate,
            "discount_usage_rate": c.discount_usage_rate,
            "acquisition_channel": c.acquisition_channel or "Organic",
            "tenure_days": c.tenure_days,
            "churn": c.churn_label,
        })

    df = pd.DataFrame(data)
    
    # Save training data
    os.makedirs("data", exist_ok=True)
    data_path = "data/retrain_data.csv"
    df.to_csv(data_path, index=False)

    # Determine new version number
    latest_version = db.query(ModelVersion).count()
    new_version_num = latest_version + 1
    new_version_str = f"v{new_version_num}"

    # Train model
    os.makedirs("ml_models", exist_ok=True)
    model_path = os.path.join("ml_models", f"model_{new_version_str}.joblib")
    model = train_model(data_path, model_path)

    # Evaluate on training data
    X = prepare_features(df)
    y = df["churn"]
    preds = model.predict(X)
    try:
        probas = model.predict_proba(X)[:, 1]
        roc = float(roc_auc_score(y, probas))
    except Exception:
        roc = 0.0

    acc = float(accuracy_score(y, preds))
    prec = float(precision_score(y, preds, zero_division=0))
    rec = float(recall_score(y, preds, zero_division=0))
    f1 = float(f1_score(y, preds, zero_division=0))

    # Deactivate previous active versions
    db.query(ModelVersion).filter(ModelVersion.is_active == True).update({"is_active": False})

    # Save new version
    new_version = ModelVersion(
        version=new_version_str,
        accuracy=acc,
        f1_score=f1,
        roc_auc=roc,
        precision_score=prec,
        recall_score=rec,
        file_path=model_path,
        is_active=True,
        training_rows=len(df),
    )
    db.add(new_version)
    db.commit()
    db.refresh(new_version)

    # Hot-reload model
    model_manager.model = model

    return {
        "version": new_version_str,
        "accuracy": round(acc, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "training_rows": len(df),
    }


def get_versions(db: Session):
    versions = db.query(ModelVersion).order_by(ModelVersion.trained_at.desc()).all()
    results = []
    for v in versions:
        results.append({
            "id": v.id,
            "version": v.version,
            "accuracy": v.accuracy,
            "f1_score": v.f1_score,
            "roc_auc": v.roc_auc,
            "precision_score": v.precision_score,
            "recall_score": v.recall_score,
            "is_active": v.is_active,
            "trained_at": str(v.trained_at) if v.trained_at else None,
            "training_rows": v.training_rows,
        })
    return results


def activate_version(db: Session, version_id: int):
    version = db.query(ModelVersion).filter(ModelVersion.id == version_id).first()
    if not version:
        raise ValueError("Version not found")

    db.query(ModelVersion).filter(ModelVersion.is_active == True).update({"is_active": False})
    version.is_active = True
    db.commit()

    # Reload model from this version's file
    import joblib
    if os.path.exists(version.file_path):
        model_manager.model = joblib.load(version.file_path)

    return version
