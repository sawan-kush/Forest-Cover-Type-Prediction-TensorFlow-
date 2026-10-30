"""Tests against the REAL artifacts in backend/model/. Skipped if they are absent."""
import json

import numpy as np
import pytest

from tests.conftest import REAL_DIR, valid_features

REFERENCE = REAL_DIR.parent / "tests" / "data" / "colab_reference_samples.json"


def test_real_artifacts_load(real_client):
    body = real_client.get("/api/health").json()
    assert body["status"] == "ok", body
    feats = real_client.get("/api/features").json()
    assert feats["feature_count"] == 54 and len(feats["continuous_features"]) == 10


def test_real_prediction_smoke(real_client):
    feats = real_client.get("/api/features").json()
    values = {f["name"]: f["default"] for f in feats["features"]}
    body = real_client.post("/api/predict", json={"features": values}).json()
    assert 1 <= body["predicted_cover_type"] <= 7
    assert sum(body["probabilities"].values()) == pytest.approx(1.0, abs=1e-4)


@pytest.mark.skipif(not REFERENCE.is_file(), reason="No Colab reference samples provided.")
def test_matches_colab_reference(real_client):
    """Compare with predictions exported from the Colab pipeline (see README)."""
    for sample in json.loads(REFERENCE.read_text()):
        body = real_client.post("/api/predict", json={"features": sample["features"]}).json()
        assert body["predicted_cover_type"] == sample["expected_cover_type"]
        got = [body["probabilities"][f"Cover Type {i}"] for i in range(1, 8)]
        np.testing.assert_allclose(got, sample["expected_probabilities"], atol=1e-4)


def test_real_api_matches_independent_reference(real_client):
    """Re-implement the pipeline by hand with the raw artifacts and compare with the API."""
    import joblib
    from keras.models import load_model

    from tests.conftest import REAL_DIR as D

    model = load_model(D / "final_forest_cover_model.keras", compile=False)
    scaler = joblib.load(D / "final_scaler.pkl")
    meta = joblib.load(D / "model_metadata.pkl")
    names, cont = list(meta["feature_columns"]), list(meta["continuous_cols"])

    values = {f["name"]: f["default"] for f in real_client.get("/api/features").json()["features"]}
    values["Elevation"], values["Slope"] = 3150, 22
    vec = np.array([values[n] for n in names], dtype="float64")
    idx = [names.index(n) for n in cont]
    vec[idx] = (vec[idx] - scaler.mean_) / scaler.scale_  # StandardScaler on continuous features only
    expected = model.predict(vec.astype("float32").reshape(1, -1), verbose=0)[0]

    body = real_client.post("/api/predict", json={"features": values}).json()
    got = np.array([body["probabilities"][f"Cover Type {i}"] for i in range(1, 8)])
    np.testing.assert_allclose(got, expected, atol=1e-5)
    assert body["predicted_cover_type"] == int(np.argmax(expected)) + 1
