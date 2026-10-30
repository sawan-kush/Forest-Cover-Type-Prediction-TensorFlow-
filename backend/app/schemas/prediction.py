from typing import Union

from pydantic import BaseModel, Field, StrictFloat, StrictInt


class PredictionRequest(BaseModel):
    """All 54 original (unscaled) feature values, keyed by feature name."""

    features: dict[str, Union[StrictInt, StrictFloat]] = Field(
        ..., description="Mapping of feature name to its original, unscaled value.")


class PredictionResponse(BaseModel):
    predicted_cover_type: int = Field(..., ge=1, le=7)
    predicted_cover_type_name: str
    confidence: float
    probabilities: dict[str, float]
    warnings: list[str] = []


class HealthResponse(BaseModel):
    status: str
    api_running: bool
    model_loaded: bool
    artifacts: dict[str, bool]
    feature_count: int
    detail: str | None = None
