# ChurnGuard AI

> E-Commerce Customer Churn Prediction & Segmentation Platform

AI-powered Web Application that predicts customer churn, segments your customer base, and suggests targeted retention actions — built with Python, Flask, Scikit-Learn, Pandas, and NumPy.

## Features

| Feature | Description |
|---------|-------------|
| **Dynamic CSV Upload** | Upload custom customer dataset CSVs with automatic column detection |
| **Churn Prediction** | RandomForestClassifier model scores each customer's churn risk probability |
| **Customer Segmentation** | Dynamic segmentation into High-Value, At-Risk, Loyal, and Dormant segments |
| **Revenue at Risk** | Total revenue at risk calculated across customer base |
| **Interactive Dashboard** | Real-time analytics, risk distributions, and customer search/filter |
| **Retention Recommendations** | Segment-based retention action strategies and offer suggestions |
| **Model Retraining** | Interactive model retraining with accuracy and F1 score comparison |
| **Scenario Simulation** | Simulate changes in customer attributes to forecast churn probability |

## Quick Start

### Installation & Local Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Shubhcodes-ui/Churnguard-AI.git
   cd Churnguard-AI
   ```

2. **Create & Activate Virtual Environment:**
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run Application:**
   ```bash
   python app.py
   ```
   Open your browser and navigate to `http://localhost:5050`.

## Architecture & Stack

- **Web Framework**: Flask (Python)
- **Machine Learning**: Scikit-Learn (`RandomForestClassifier`)
- **Data Processing**: Pandas, NumPy
- **Templating & UI**: Jinja2 HTML templates, CSS, JavaScript
- **State Management**: In-Memory Server-Side Session State Store

## Core API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Landing page / Dataset Upload interface |
| `/upload` | POST | Upload CSV dataset and initialize ML model |
| `/dashboard` | GET | Main analytics dashboard and customer table |
| `/api/customers` | GET | Customer data with filters and search |
| `/api/simulate` | POST | Simulate customer feature changes for risk prediction |
| `/api/retrain` | POST | Retrain RandomForest model and compare metrics |
| `/api/health` | GET | System health check and dataset status |
