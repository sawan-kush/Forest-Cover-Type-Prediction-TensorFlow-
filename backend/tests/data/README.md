# Colab reference samples

To prove the backend reproduces your Colab pipeline exactly, export a few test rows from Colab and save them
here as `colab_reference_samples.json`. `tests/test_real_artifacts.py` picks the file up automatically.

Run this in your Colab notebook (adapt the variable names to yours). `X_test_raw` must be the **unscaled**
test features (columns in the same order as `model_metadata.pkl`).

```python
import json, joblib, numpy as np

meta = joblib.load("model_metadata.pkl")
feature_names, continuous = meta["feature_names"], meta["continuous_features"]  # adjust keys if needed

samples = []
for i in X_test_raw.sample(10, random_state=1).index:
    raw = X_test_raw.loc[[i], feature_names].copy()
    scaled = raw.copy()
    scaled[continuous] = scaler.transform(raw[continuous])
    probs = model.predict(scaled.values.astype("float32"), verbose=0)[0]
    samples.append({
        "features": {k: float(v) for k, v in raw.iloc[0].items()},
        "expected_cover_type": int(np.argmax(probs)) + 1,
        "expected_probabilities": [float(p) for p in probs],
    })

json.dump(samples, open("colab_reference_samples.json", "w"), indent=2)
```

Then, from `backend/`: `pytest tests/test_real_artifacts.py -v`
