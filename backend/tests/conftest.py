"""Test fixtures.

`stand_in_artifacts` builds a small, throw-away Keras model + fitted scaler +
metadata in a temp folder. It exists ONLY to test the pipeline code (ordering,
scaling, validation, API contract). It is never shipped and never used by the
application. Tests marked `real_artifacts` use the real files in backend/model/.
"""
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import pytest
from fastapi.testclient import TestClient
from sklearn.preprocessing import StandardScaler

from app.core.config import BASE_DIR, Settings
from app.main import create_app

CONTINUOUS = [
    "Elevation", "Aspect", "Slope", "Horizontal_Distance_To_Hydrology",
    "Vertical_Distance_To_Hydrology", "Horizontal_Distance_To_Roadways",
    "Hillshade_9am", "Hillshade_Noon", "Hillshade_3pm", "Horizontal_Distance_To_Fire_Points",
]
FEATURES = CONTINUOUS + [f"Wilderness_Area{i}" for i in range(1, 5)] + [f"Soil_Type{i}" for i in range(1, 41)]
REAL_DIR = BASE_DIR / "model"
REAL_FILES = ["final_forest_cover_model.keras", "final_scaler.pkl", "model_metadata.pkl"]


def valid_features(**overrides) -> dict:
    values = {"Elevation": 2800, "Aspect": 120, "Slope": 12, "Horizontal_Distance_To_Hydrology": 250,
              "Vertical_Distance_To_Hydrology": 40, "Horizontal_Distance_To_Roadways": 1800,
              "Hillshade_9am": 215, "Hillshade_Noon": 225, "Hillshade_3pm": 140,
              "Horizontal_Distance_To_Fire_Points": 1500}
    values.update({n: 0 for n in FEATURES if n.startswith(("Wilderness_Area", "Soil_Type"))})
    values["Wilderness_Area3"] = 1
    values["Soil_Type10"] = 1
    values.update(overrides)
    return values


@pytest.fixture(scope="session")
def stand_in_dir(tmp_path_factory) -> Path:
    import keras

    d = tmp_path_factory.mktemp("stand_in_artifacts")
    rng = np.random.default_rng(0)
    train = pd.DataFrame(rng.normal(loc=[2900, 150, 14, 270, 46, 2300, 212, 223, 143, 1900],
                                    scale=[280, 110, 7, 210, 58, 1500, 27, 20, 38, 1300], size=(500, 10)),
                         columns=CONTINUOUS)
    scaler = StandardScaler().fit(train)
    joblib.dump(scaler, d / "final_scaler.pkl")
    joblib.dump({"feature_names": FEATURES, "continuous_features": CONTINUOUS}, d / "model_metadata.pkl")
    keras.utils.set_random_seed(1)
    model = keras.Sequential([keras.Input(shape=(54,)), keras.layers.Dense(16, activation="relu"),
                              keras.layers.Dense(7, activation="softmax")])
    model.save(d / "final_forest_cover_model.keras")
    return d


@pytest.fixture(scope="session")
def stand_in_client(stand_in_dir):
    app = create_app(Settings(model_dir=stand_in_dir))
    with TestClient(app) as client:
        yield client


@pytest.fixture(scope="session")
def real_client():
    if not all((REAL_DIR / f).is_file() for f in REAL_FILES):
        pytest.skip("Real model artifacts are not in backend/model/.")
    app = create_app(Settings(model_dir=REAL_DIR))
    with TestClient(app) as client:
        yield client
