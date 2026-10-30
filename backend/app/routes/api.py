from fastapi import APIRouter, Request

from app.schemas.prediction import HealthResponse, PredictionRequest, PredictionResponse
from app.services.model_service import ModelService

router = APIRouter(prefix="/api")


def _svc(request: Request) -> ModelService:
    return request.app.state.model_service


@router.get("/health", response_model=HealthResponse)
def health(request: Request):
    svc = _svc(request)
    return HealthResponse(
        status="ok" if svc.loaded else "degraded",
        api_running=True,
        model_loaded=svc.loaded,
        artifacts=svc.artifact_status,
        feature_count=len(svc.feature_names),
        detail=svc.load_error,
    )


@router.get("/features")
def features(request: Request):
    return _svc(request).feature_info()


@router.post("/predict", response_model=PredictionResponse)
def predict(payload: PredictionRequest, request: Request):
    return _svc(request).predict(payload.features)
