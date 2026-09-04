import pandas as pd
from datetime import datetime, timezone
from app.models.batch_job import BatchJob
from app.database import SessionLocal
from app.services.prediction_service import predict_single

def start_batch_job(db, file_path: str, total_rows: int) -> int:
    job = BatchJob(
        file_path=file_path,
        total_rows=total_rows,
        processed_rows=0,
        status="pending"
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job.id

def process_batch_job(job_id: int, file_path: str):
    db = SessionLocal()
    job = None
    try:
        job = db.query(BatchJob).filter(BatchJob.id == job_id).first()
        if not job:
            return

        # Count total rows first so progress % is meaningful
        total = sum(1 for _ in pd.read_csv(file_path, chunksize=500))
        # total is chunk count — re-read to get row count
        row_count = sum(len(chunk) for chunk in pd.read_csv(file_path, chunksize=500))
        job.total_rows = row_count
        job.status = "processing"
        db.commit()

        chunksize = 500
        processed = 0
        for chunk in pd.read_csv(file_path, chunksize=chunksize):
            records = chunk.to_dict(orient="records")
            for record in records:
                try:
                    predict_single(db, record)
                except Exception:
                    pass
                processed += 1

            job.processed_rows = processed
            db.commit()

        job.status = "completed"
        job.completed_at = datetime.now(timezone.utc)
        db.commit()
    except Exception:
        if job:
            job.status = "failed"
            db.commit()
    finally:
        db.close()

def get_batch_status(db, job_id: int):
    return db.query(BatchJob).filter(BatchJob.id == job_id).first()
