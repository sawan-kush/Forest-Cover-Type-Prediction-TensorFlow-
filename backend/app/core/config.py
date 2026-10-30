"""Application settings, read from environment variables (see .env.example)."""
from functools import lru_cache
from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]  # backend/


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Forest Cover Type Prediction API"
    app_version: str = "1.0.0"

    # Artifact locations
    model_dir: Path = BASE_DIR / "model"
    model_filename: str = "final_forest_cover_model.keras"
    scaler_filename: str = "final_scaler.pkl"
    metadata_filename: str = "model_metadata.pkl"

    # Optional overrides if model_metadata.pkl uses different key names
    metadata_features_key: Optional[str] = None
    metadata_continuous_key: Optional[str] = None

    # CORS: comma-separated list of allowed origins
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    # Optional regex, e.g. https://.*\.vercel\.app for Vercel preview deployments
    cors_origin_regex: Optional[str] = None

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip().rstrip("/") for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
