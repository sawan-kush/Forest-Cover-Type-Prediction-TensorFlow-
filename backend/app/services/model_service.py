"""Loads the trained ANN, fitted scaler and metadata once, and runs predictions.

Preprocessing is done here (never in the frontend):
  1. build a one-row DataFrame in the exact metadata feature order
  2. scale ONLY the continuous features with the saved StandardScaler
  3. feed the 54-feature vector to the ANN
  4. map output index 0-6 back to Cover Type 1-7
"""
import logging
import math
import threading
from pathlib import Path
from typing import Any, Mapping, Optional

import joblib
import numpy as np
import pandas as pd

from app.core.config import Settings
from app.core.exceptions import ArtifactLoadError, InputValidationError, ModelNotReadyError
from app.core.feature_catalog import CLASS_NAMES, GROUPS, describe_feature, one_hot_group

logger = logging.getLogger("app.model")

EXPECTED_FEATURES = 54
EXPECTED_CONTINUOUS = 10
EXPECTED_CLASSES = 7

_FEATURE_KEY_CANDIDATES = ["feature_names", "features", "all_features", "feature_columns", "columns"]
_CONTINUOUS_KEY_CANDIDATES = ["continuous_features", "continuous_feature_names", "continuous_cols",
                              "continuous_columns", "numerical_features", "scaled_features"]


class ModelService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.model: Any = None
        self.scaler: Any = None
        self.feature_names: list[str] = []
        self.continuous_features: list[str] = []
        self.scaler_columns: list[str] = []
        self.catalog: dict[str, dict] = {}
        self.loaded = False
        self.load_error: Optional[str] = None
        self.artifact_status = {"model": False, "scaler": False, "metadata": False}
        self._lock = threading.Lock()

    # ------------------------------------------------------------------ loading
    def load(self) -> None:
        """Load all artifacts. Never raises: failures are stored in `load_error`."""
        try:
            self._load()
            self.loaded, self.load_error = True, None
            logger.info("Artifacts loaded: %d features, %d continuous, %d classes",
                        len(self.feature_names), len(self.continuous_features), EXPECTED_CLASSES)
        except Exception as exc:  # noqa: BLE001 - reported through /api/health
            self.loaded, self.load_error = False, str(exc)
            logger.error("Artifact loading failed: %s", exc)

    def _path(self, filename: str) -> Path:
        path = self.settings.model_dir / filename
        if not path.is_file():
            raise ArtifactLoadError(f"Required artifact not found: {path}")
        return path

    def _load(self) -> None:
        s = self.settings
        meta_path = self._path(s.metadata_filename)
        scaler_path = self._path(s.scaler_filename)
        model_path = self._path(s.model_filename)

        try:
            metadata = joblib.load(meta_path)
            self.artifact_status["metadata"] = True
        except Exception as exc:
            raise ArtifactLoadError(f"Could not read {meta_path.name}: {exc}") from exc
        self.feature_names, self.continuous_features = self._parse_metadata(metadata)

        try:
            self.scaler = joblib.load(scaler_path)
            self.artifact_status["scaler"] = True
        except Exception as exc:
            raise ArtifactLoadError(
                f"Could not read {scaler_path.name}: {exc}. The scaler was saved with "
                "scikit-learn 1.6.1; install that exact version."
            ) from exc
        self.scaler_columns = self._check_scaler()

        try:
            import keras  # imported lazily so the API can start and report errors

            self.model = keras.models.load_model(model_path, compile=False)
            self.artifact_status["model"] = True
        except Exception as exc:
            raise ArtifactLoadError(f"Could not read {model_path.name}: {exc}") from exc
        self._check_model()

        self.catalog = {n: describe_feature(n, n in self.continuous_features)
                        for n in self.feature_names}

    def _parse_metadata(self, metadata: Any) -> tuple[list[str], list[str]]:
        if not isinstance(metadata, Mapping):
            raise ArtifactLoadError(
                f"model_metadata.pkl must contain a dict, found {type(metadata).__name__}.")
        feat_key = self._pick_key(metadata, self.settings.metadata_features_key,
                                  _FEATURE_KEY_CANDIDATES, "feature names")
        cont_key = self._pick_key(metadata, self.settings.metadata_continuous_key,
                                  _CONTINUOUS_KEY_CANDIDATES, "continuous feature names")
        features = [str(x) for x in list(metadata[feat_key])]
        continuous = [str(x) for x in list(metadata[cont_key])]

        if len(features) != EXPECTED_FEATURES:
            raise ArtifactLoadError(f"Metadata lists {len(features)} features, expected {EXPECTED_FEATURES}.")
        if len(set(features)) != len(features):
            raise ArtifactLoadError("Metadata feature names contain duplicates.")
        if len(continuous) != EXPECTED_CONTINUOUS:
            raise ArtifactLoadError(
                f"Metadata lists {len(continuous)} continuous features, expected {EXPECTED_CONTINUOUS}.")
        missing = [c for c in continuous if c not in features]
        if missing:
            raise ArtifactLoadError(f"Continuous features not found in feature list: {missing}")
        return features, continuous

    @staticmethod
    def _pick_key(metadata: Mapping, override: Optional[str], candidates: list[str], what: str) -> str:
        if override:
            if override not in metadata:
                raise ArtifactLoadError(f"Configured metadata key '{override}' not found. "
                                        f"Keys present: {list(metadata.keys())}")
            return override
        for key in candidates:
            if key in metadata:
                return key
        raise ArtifactLoadError(
            f"Could not find the {what} in model_metadata.pkl. Keys present: {list(metadata.keys())}. "
            "Set METADATA_FEATURES_KEY / METADATA_CONTINUOUS_KEY in the environment.")

    def _check_scaler(self) -> list[str]:
        n_in = getattr(self.scaler, "n_features_in_", None)
        if n_in != EXPECTED_CONTINUOUS:
            raise ArtifactLoadError(f"Scaler was fitted on {n_in} features, expected {EXPECTED_CONTINUOUS}.")
        names = getattr(self.scaler, "feature_names_in_", None)
        if names is None:
            return list(self.continuous_features)  # fitted on an array: metadata order is the order
        names = [str(n) for n in names]
        if set(names) != set(self.continuous_features):
            raise ArtifactLoadError(
                "Scaler feature names do not match the continuous features in the metadata: "
                f"{names} vs {self.continuous_features}")
        return names  # use the scaler's own column order

    def _check_model(self) -> None:
        in_shape, out_shape = self.model.input_shape, self.model.output_shape
        if in_shape[-1] != EXPECTED_FEATURES:
            raise ArtifactLoadError(f"Model expects {in_shape[-1]} input features, expected {EXPECTED_FEATURES}.")
        if out_shape[-1] != EXPECTED_CLASSES:
            raise ArtifactLoadError(f"Model outputs {out_shape[-1]} classes, expected {EXPECTED_CLASSES}.")

    # --------------------------------------------------------------- metadata
    def feature_info(self) -> dict:
        self._ensure_ready()
        used = {c["group"] for c in self.catalog.values()}
        groups = []
        for g in GROUPS:
            if g["id"] in used:
                names = [n for n in self.feature_names if self.catalog[n]["group"] == g["id"]]
                groups.append({**g, "feature_names": names})
        return {
            "feature_count": len(self.feature_names),
            "feature_names": self.feature_names,
            "continuous_features": self.continuous_features,
            "features": [self.catalog[n] for n in self.feature_names],
            "groups": groups,
            "class_names": {str(k): v for k, v in CLASS_NAMES.items()},
        }

    # ------------------------------------------------------------- validation
    def validate(self, raw: Mapping[str, float]) -> list[str]:
        """Raise InputValidationError for bad input; return non-fatal warnings."""
        errors: list[dict] = []
        warnings: list[str] = []

        for name in self.feature_names:
            if name not in raw:
                errors.append({"field": name, "message": "Required feature is missing."})
        for name in raw:
            if name not in self.catalog:
                errors.append({"field": name, "message": "Unknown feature name."})

        for name in self.feature_names:
            if name not in raw:
                continue
            value, info = raw[name], self.catalog[name]
            if isinstance(value, bool) or not isinstance(value, (int, float)):
                errors.append({"field": name, "message": "Value must be a number."})
                continue
            if not math.isfinite(value):
                errors.append({"field": name, "message": "Value must be a finite number."})
                continue
            if info["kind"] == "binary":
                if value not in (0, 1):
                    errors.append({"field": name, "message": "Value must be 0 or 1."})
                continue
            lo, hi = info.get("hard_min"), info.get("hard_max")
            if lo is not None and value < lo or hi is not None and value > hi:
                errors.append({"field": name,
                               "message": f"Value must be between {lo} and {hi} {info.get('unit', '')}".strip() + "."})
            elif info.get("typical_min") is not None and (
                    value < info["typical_min"] or value > info["typical_max"]):
                warnings.append(
                    f"{info['label']} ({value:g}) is outside the range seen in the training data "
                    f"({info['typical_min']:g} to {info['typical_max']:g}); the prediction may be unreliable.")

        # Training data is strictly one-hot for wilderness area and soil type.
        for gid, title in (("wilderness", "wilderness area"), ("soil", "soil type")):
            members = [n for n in self.feature_names if one_hot_group(n) == gid and n in raw]
            vals = [raw[n] for n in members if raw[n] in (0, 1) and not isinstance(raw[n], bool)]
            if members and len(vals) == len(members) and sum(vals) != 1:
                errors.append({"field": gid, "message": f"Exactly one {title} must be selected (found {int(sum(vals))})."})

        if errors:
            raise InputValidationError(errors)
        return warnings

    # ------------------------------------------------------------ prediction
    def preprocess(self, raw: Mapping[str, float]) -> np.ndarray:
        """Original values -> model-ready (1, 54) array. Scales only continuous features."""
        row = {n: float(raw[n]) for n in self.feature_names}
        df = pd.DataFrame([row], columns=self.feature_names)  # exact metadata order
        df[self.scaler_columns] = self.scaler.transform(df[self.scaler_columns])
        return df.to_numpy(dtype="float32")

    def predict(self, raw: Mapping[str, float]) -> dict:
        self._ensure_ready()
        warnings = self.validate(raw)
        x = self.preprocess(raw)
        with self._lock:
            probs = np.asarray(self.model(x, training=False)).reshape(-1)
        if probs.shape[0] != EXPECTED_CLASSES or not np.all(np.isfinite(probs)):
            raise RuntimeError("Model returned an invalid probability vector.")
        idx = int(np.argmax(probs))
        cover_type = idx + 1  # ANN indices 0-6 -> original labels 1-7
        return {
            "predicted_cover_type": cover_type,
            "predicted_cover_type_name": CLASS_NAMES[cover_type],
            "confidence": float(probs[idx]),
            "probabilities": {f"Cover Type {i + 1}": float(p) for i, p in enumerate(probs)},
            "warnings": warnings,
        }

    def _ensure_ready(self) -> None:
        if not self.loaded:
            raise ModelNotReadyError(
                f"The model is not available: {self.load_error or 'artifacts have not been loaded.'}")
