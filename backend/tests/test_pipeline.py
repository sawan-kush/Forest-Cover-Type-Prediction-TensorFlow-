"""Pipeline tests run against stand-in artifacts (code-path checks only)."""
import numpy as np
import pytest

from tests.conftest import CONTINUOUS, FEATURES, valid_features


def test_health_reports_loaded(stand_in_client):
    body = stand_in_client.get("/api/health").json()
    assert body["status"] == "ok" and body["model_loaded"] is True
    assert body["artifacts"] == {"model": True, "scaler": True, "metadata": True}


def test_features_endpoint_returns_54_in_order(stand_in_client):
    body = stand_in_client.get("/api/features").json()
    assert body["feature_count"] == 54
    assert body["feature_names"] == FEATURES
    assert body["continuous_features"] == CONTINUOUS
    assert [f["name"] for f in body["features"]] == FEATURES
    grouped = [n for g in body["groups"] for n in g["feature_names"]]
    assert sorted(grouped) == sorted(FEATURES)  # every feature appears in exactly one group


def test_predict_contract(stand_in_client):
    r = stand_in_client.post("/api/predict", json={"features": valid_features()})
    assert r.status_code == 200
    body = r.json()
    assert 1 <= body["predicted_cover_type"] <= 7
    assert len(body["probabilities"]) == 7
    assert sum(body["probabilities"].values()) == pytest.approx(1.0, abs=1e-4)
    assert body["confidence"] == pytest.approx(max(body["probabilities"].values()))
    top = max(body["probabilities"], key=body["probabilities"].get)
    assert top == f"Cover Type {body['predicted_cover_type']}"


def test_only_continuous_features_are_scaled(stand_in_client):
    svc = stand_in_client.app.state.model_service
    raw = valid_features()
    x = svc.preprocess(raw)[0]
    assert x.shape == (54,)
    for i, name in enumerate(FEATURES):
        if name in CONTINUOUS:
            j = list(svc.scaler.feature_names_in_).index(name)
            expected = (raw[name] - svc.scaler.mean_[j]) / svc.scaler.scale_[j]
            assert x[i] == pytest.approx(expected, rel=1e-4, abs=1e-4), name
        else:
            assert x[i] == raw[name], name  # binary features untouched


def test_api_matches_independent_reference(stand_in_client):
    """Re-implement the pipeline by hand and compare with the API output."""
    svc = stand_in_client.app.state.model_service
    raw = valid_features(Elevation=3100, Slope=30)
    vec = np.array([raw[n] for n in FEATURES], dtype="float64")
    idx = [FEATURES.index(n) for n in svc.scaler.feature_names_in_]
    vec[idx] = (vec[idx] - svc.scaler.mean_) / svc.scaler.scale_
    expected = svc.model.predict(vec.astype("float32").reshape(1, -1), verbose=0)[0]
    body = stand_in_client.post("/api/predict", json={"features": raw}).json()
    got = np.array([body["probabilities"][f"Cover Type {i}"] for i in range(1, 8)])
    np.testing.assert_allclose(got, expected, atol=1e-5)
    assert body["predicted_cover_type"] == int(np.argmax(expected)) + 1


def test_missing_features_reported_by_name(stand_in_client):
    feats = valid_features()
    del feats["Elevation"], feats["Soil_Type5"]
    r = stand_in_client.post("/api/predict", json={"features": feats})
    assert r.status_code == 422
    fields = {e["field"] for e in r.json()["errors"]}
    assert {"Elevation", "Soil_Type5"} <= fields


@pytest.mark.parametrize("override, field", [
    ({"Elevation": "high"}, "Elevation"),
    ({"Slope": True}, "Slope"),
    ({"Slope": 120}, "Slope"),
    ({"Aspect": -5}, "Aspect"),
    ({"Hillshade_Noon": 300}, "Hillshade_Noon"),
    ({"Soil_Type3": 2}, "Soil_Type3"),
])
def test_invalid_values_rejected(stand_in_client, override, field):
    r = stand_in_client.post("/api/predict", json={"features": valid_features(**override)})
    assert r.status_code == 422, r.text
    assert any(e["field"].endswith(field.split(".")[-1]) for e in r.json()["errors"])


def test_one_hot_groups_enforced(stand_in_client):
    r = stand_in_client.post("/api/predict", json={"features": valid_features(Wilderness_Area1=1)})
    assert r.status_code == 422
    assert any(e["field"] == "wilderness" for e in r.json()["errors"])
    r = stand_in_client.post("/api/predict", json={"features": valid_features(Soil_Type10=0)})
    assert any(e["field"] == "soil" for e in r.json()["errors"])


def test_unknown_feature_and_bad_body(stand_in_client):
    r = stand_in_client.post("/api/predict", json={"features": {**valid_features(), "Extra": 1}})
    assert r.status_code == 422
    r = stand_in_client.post("/api/predict", json={"wrong": 1})
    assert r.status_code == 422 and r.json()["errors"]


def test_out_of_training_range_gives_warning_not_error(stand_in_client):
    r = stand_in_client.post("/api/predict", json={"features": valid_features(Elevation=5000)})
    assert r.status_code == 200 and r.json()["warnings"]


def test_missing_artifacts_reported_clearly(tmp_path):
    from fastapi.testclient import TestClient
    from app.core.config import Settings
    from app.main import create_app

    with TestClient(create_app(Settings(model_dir=tmp_path))) as client:
        h = client.get("/api/health").json()
        assert h["status"] == "degraded" and "not found" in h["detail"]
        r = client.post("/api/predict", json={"features": valid_features()})
        assert r.status_code == 503
