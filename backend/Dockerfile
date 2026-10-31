# syntax=docker/dockerfile:1

# Python 3.11 matches backend/.python-version (3.11.9) and render.yaml.
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    TF_CPP_MIN_LOG_LEVEL=2

WORKDIR /app

# 1) Install dependencies first. This layer is cached and only rebuilt
#    when requirements.txt changes (TensorFlow is a big download).
COPY requirements.txt .
RUN pip install -r requirements.txt

# 2) Copy the application code and the trained model artifacts.
#    (config.py resolves the model folder to /app/model, which is where it lands.)
COPY app ./app
COPY model ./model
COPY scripts ./scripts

# Run as a non-root user.
RUN useradd --create-home --uid 10001 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Healthy only when the API answers AND the model artifacts loaded successfully.
HEALTHCHECK --interval=15s --timeout=5s --start-period=90s --retries=5 \
  CMD ["python", "-c", "import json,sys,urllib.request; r=json.load(urllib.request.urlopen('http://127.0.0.1:8000/api/health', timeout=4)); sys.exit(0 if r.get('model_loaded') else 1)"]

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]