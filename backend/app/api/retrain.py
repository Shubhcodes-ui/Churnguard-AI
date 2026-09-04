from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.retrain_service import retrain_model, get_versions, activate_version

router = APIRouter()

@router.post("/")
def trigger_retraining(db: Session = Depends(get_db)):
    try:
        result = retrain_model(db)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/versions")
def list_versions(db: Session = Depends(get_db)):
    versions = get_versions(db)
    return versions

@router.post("/versions/{version_id}/activate")
def activate_model_version(version_id: int, db: Session = Depends(get_db)):
    try:
        version = activate_version(db, version_id)
        return {"message": f"Version {version.version} activated successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
