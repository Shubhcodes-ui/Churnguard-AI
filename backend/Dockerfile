FROM python:3.11-slim

WORKDIR /app

# System deps for LightGBM
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libgomp1 \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create directories for model artifacts and uploads
RUN mkdir -p ml_models data

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
