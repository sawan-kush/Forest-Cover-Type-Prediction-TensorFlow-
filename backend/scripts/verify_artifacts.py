"""Check that the three artifacts load and are mutually consistent.

Usage (from backend/):  python scripts/verify_artifacts.py
"""
import os
import sys
from pathlib import Path

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import sklearn  # noqa: E402

from app.core.config import get_settings  # noqa: E402
from app.services.model_service import ModelService  # noqa: E402


def main() -> int:
    print(f"scikit-learn version: {sklearn.__version__} (scaler was saved with 1.6.1)")
    svc = ModelService(get_settings())
    svc.load()
    if not svc.loaded:
        print(f"FAILED: {svc.load_error}")
        return 1
    print(f"OK: {len(svc.feature_names)} features, {len(svc.continuous_features)} continuous")
    print("Continuous features:", svc.continuous_features)
    print("Scaler column order:", svc.scaler_columns)
    print("Model input/output shape:", svc.model.input_shape, svc.model.output_shape)
    return 0


if __name__ == "__main__":
    sys.exit(main())
