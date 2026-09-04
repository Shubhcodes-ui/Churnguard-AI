# ChurnGuard AI

> E-Commerce Customer Churn Prediction & Segmentation Platform

AI-powered SaaS platform that predicts customer churn, segments your customer base, and suggests targeted retention offers — built for e-commerce businesses.

## Quick Start

### Local Development

**Backend:**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Docker (Full Stack)
```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Demo Credentials
Sign up with any email/password on first run. The system auto-seeds 3,000 demo customers so the dashboard is immediately populated.

## Features

| Feature | Description |
|---------|-------------|
| **Churn Prediction** | LightGBM model scores each customer's churn probability |
| **SHAP Explainability** | Top 3 reasons per customer driving churn risk |
| **RFM Segmentation** | High-Value, Loyal, At-Risk, Dormant segments |
| **Revenue at Risk** | Σ(churn_probability × CLV) hero metric |
| **Batch Scoring** | Upload CSV of any size, scored in background |
| **Retention Engine** | Auto-suggested discount/offer tiers per segment |
| **Model Retraining** | Retrain on latest data, version comparison |
| **Live Simulation** | Simulate customer events for real-time demo |

## Architecture

- **Backend**: FastAPI + SQLAlchemy + LightGBM + SHAP
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui + Recharts
- **Database**: SQLite (dev) / PostgreSQL (docker/prod)
- **Deployment**: Docker Compose (3 containers: api, db, frontend)

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup` | POST | Create account |
| `/api/auth/login` | POST | Get JWT tokens |
| `/api/predict` | POST | Single customer prediction |
| `/api/predict/batch` | POST | Batch CSV upload + scoring |
| `/api/segment` | GET | Segment summary |
| `/api/metrics/dashboard` | GET | Dashboard hero metrics |
| `/api/metrics/trends` | GET | Churn trends over time |
| `/api/retention/suggestions` | GET | Auto-generated retention offers |
| `/api/retrain` | POST | Retrain model on latest data |
| `/api/simulate` | POST | Simulate live customer event |
