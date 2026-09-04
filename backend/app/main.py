import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base, SessionLocal
from app.ml.model_manager import model_manager
from app.ml.seed_data import generate_seed_data
from app.services.prediction_service import predict_single
from app.services.segmentation_service import compute_segments
from app.models.customer import Customer

from app.api.auth import router as auth_router
from app.api.predict import router as predict_router
from app.api.customers import router as customers_router
from app.api.metrics import router as metrics_router
from app.api.segment import router as segment_router
from app.api.retention import router as retention_router
from app.api.retrain import router as retrain_router
from app.api.simulate import router as simulate_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)

    logger.info("Initializing ML model...")
    model_manager.load_or_train()

    db = SessionLocal()
    try:
        count = db.query(Customer).count()
        if count == 0:
            logger.info("Seeding 3000 demo customers...")
            df = generate_seed_data(3000)
            records = df.to_dict(orient="records")
            for i, record in enumerate(records):
                record["customer_ext_id"] = record.pop("customer_id", f"CUST-{i+1:04d}")
                try:
                    predict_single(db, record)
                except Exception as e:
                    logger.warning(f"Seed row {i} failed: {e}")
                if (i + 1) % 500 == 0:
                    logger.info(f"  Seeded {i+1}/{len(records)} customers...")

            logger.info("Computing initial segments...")
            compute_segments(db)
            logger.info(f"Seed complete: {db.query(Customer).count()} customers loaded.")
    except Exception as e:
        logger.error(f"Startup error: {e}", exc_info=True)
    finally:
        db.close()

    yield
    logger.info("Shutting down ChurnGuard AI...")


app = FastAPI(
    title="ChurnGuard AI API",
    description="E-Commerce Customer Churn Prediction & Segmentation",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(predict_router, prefix="/api/predict", tags=["Prediction"])
app.include_router(customers_router, prefix="/api/customers", tags=["Customers"])
app.include_router(metrics_router, prefix="/api/metrics", tags=["Metrics"])
app.include_router(segment_router, prefix="/api/segment", tags=["Segments"])
app.include_router(retention_router, prefix="/api/retention", tags=["Retention"])
app.include_router(retrain_router, prefix="/api/retrain", tags=["Retrain"])
app.include_router(simulate_router, prefix="/api/simulate", tags=["Simulate"])


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "ChurnGuard AI"}
