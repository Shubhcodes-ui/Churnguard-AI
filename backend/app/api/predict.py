import os
import shutil
from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import PredictRequest, PredictResponse
from app.services.prediction_service import predict_single
from app.services.batch_service import start_batch_job, process_batch_job, get_batch_status

router = APIRouter()

@router.post("/", response_model=PredictResponse)
def predict_churn(request: PredictRequest, db: Session = Depends(get_db)):
    data = request.model_dump()
    result = predict_single(db, data)
    return result

@router.post("/batch")
def batch_predict(background_tasks: BackgroundTasks, file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
        
    os.makedirs("data/uploads", exist_ok=True)
    file_path = f"data/uploads/{file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # We estimate rows or just set total_rows to 0 and calculate later
    job_id = start_batch_job(db, file_path, total_rows=0)
    
    background_tasks.add_task(process_batch_job, job_id, file_path)
    
    return {"job_id": job_id, "status": "pending", "message": "Batch job started"}

@router.get("/batch/{job_id}")
def batch_status(job_id: int, db: Session = Depends(get_db)):
    job = get_batch_status(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Batch job not found")
        
    progress_pct = 0
    if job.total_rows > 0:
        progress_pct = round((job.processed_rows / job.total_rows) * 100, 2)
    elif job.status == "completed":
        progress_pct = 100
        
    return {
        "job_id": job.id,
        "status": job.status,
        "processed_rows": job.processed_rows,
        "total_rows": job.total_rows,
        "progress_pct": progress_pct
    }
