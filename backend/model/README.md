# Model artifacts

This folder contains the three trained artifacts used by the API:

- `final_forest_cover_model.keras` - trained ANN (54 inputs, 7 softmax outputs)
- `final_scaler.pkl` - fitted StandardScaler for the 10 continuous features (scikit-learn 1.6.1)
- `model_metadata.pkl` - dict with `feature_columns` (54 names, training order) and `continuous_cols` (10 names)

They are loaded once when the API starts. Run `python scripts/verify_artifacts.py` from `backend/` to check them.
