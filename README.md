# Forest Cover Type Prediction using Artificial Neural Networks

An end-to-end machine learning project that predicts forest cover type from cartographic and environmental features. A TensorFlow/Keras Artificial Neural Network (ANN) is trained on the Forest Cover Type dataset to classify forest regions into seven cover categories, reaching **92.87% test accuracy** and a **89.45% macro F1-score**. The repository now also contains a full-stack web application (React + TypeScript frontend, FastAPI backend) that serves the trained model.

![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12-blue)
![TensorFlow](https://img.shields.io/badge/TensorFlow-Keras-orange)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.6.1-yellow)
![FastAPI](https://img.shields.io/badge/API-FastAPI-009688)
![React](https://img.shields.io/badge/UI-React%20%2B%20TypeScript-61dafb)
![Task](https://img.shields.io/badge/Task-Multiclass%20Classification-green)

---

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Dataset](#dataset)
4. [Data Preprocessing](#data-preprocessing)
5. [Model Architecture](#model-architecture)
6. [Hyperparameter Experimentation](#hyperparameter-experimentation)
7. [Model Performance](#model-performance)
8. [Prediction Pipeline](#prediction-pipeline)
9. [Saved Model Artifacts](#saved-model-artifacts)
10. [Using the Saved Model for Inference](#using-the-saved-model-for-inference)
11. [Web Application](#web-application)
12. [Technologies Used](#technologies-used)
13. [Repository Structure](#repository-structure)
14. [Reproducing the Model (Notebook)](#reproducing-the-model-notebook)
15. [Limitations](#limitations)
16. [Future Improvements](#future-improvements)
17. [Author](#author)
18. [Acknowledgements](#acknowledgements)

---

## Project Overview

Forest ecosystems are shaped by geographical and environmental factors such as elevation, slope, soil composition, hydrology, sunlight exposure, and distance from roads and fire ignition points.

This project builds a multiclass classifier that predicts the forest cover type of a land cell from these cartographic characteristics. It covers the full workflow: data inspection, preprocessing, feature scaling, neural network design, hyperparameter experimentation, evaluation, and a reusable prediction pipeline.

### Key Highlights

- ANN built with TensorFlow and Keras.
- 54 input features and 7 output classes.
- Approximately 581,000 observations.
- Stratified training, validation, and test splits.
- StandardScaler applied to the 10 continuous features only.
- Hyperparameter experiments to validate the final architecture.
- Final test accuracy of approximately 92.87% and macro F1-score of approximately 89.45%.
- Saved artifacts for inference without retraining.

---

---

## Problem Statement

Given 54 cartographic and environmental attributes of a forest region, predict its forest cover type. This is a **multiclass classification** problem with seven possible outputs.

### Target Classes

| Class | Forest Cover Type |
|---|---|
| 1 | Spruce/Fir |
| 2 | Lodgepole Pine |
| 3 | Ponderosa Pine |
| 4 | Cottonwood/Willow |
| 5 | Aspen |
| 6 | Douglas-fir |
| 7 | Krummholz |

---

---

## Dataset

**Dataset:** Forest Cover Type Dataset
**Source:** [Kaggle - Forest Cover Type Dataset](https://www.kaggle.com/datasets/uciml/forest-cover-type-dataset)

The dataset contains approximately 581,012 observations and 55 columns: 54 input features and 1 target column (`Cover_Type`).

### Feature Categories

| Category | Features | Description |
|---|---|---|
| Elevation | 1 | Elevation of the forest region |
| Aspect | 1 | Compass direction the slope faces |
| Slope | 1 | Steepness of the terrain |
| Hydrology | 2 | Horizontal and vertical distance to the nearest water feature |
| Roadways | 1 | Horizontal distance to the nearest roadway |
| Hillshade | 3 | Hillshade index at 9am, noon, and 3pm |
| Fire Points | 1 | Horizontal distance to the nearest wildfire ignition point |
| Wilderness Areas | 4 | Binary indicators for four wilderness areas |
| Soil Types | 40 | Binary indicators for 40 soil types |
| **Total** | **54** | |

### Dataset Splitting

Stratified sampling was used to preserve the class distribution in every split.

| Dataset | Percentage | Observations |
|---|---:|---:|
| Training | 70% | 406,708 |
| Validation | 15% | 87,152 |
| Testing | 15% | 87,152 |

The test set was kept separate from model training and hyperparameter selection.

---

---

## Data Preprocessing

1. Inspected the dataset structure and feature distributions.
2. Checked for missing values and data consistency.
3. Separated input features from the target variable.
4. Performed a stratified train, validation, and test split.
5. Scaled the continuous numerical features.
6. Converted target labels from 1-7 to 0-6 for ANN training.

### Feature Scaling

`StandardScaler` was applied to exactly these 10 continuous features:

| # | Feature |
|---|---|
| 1 | Elevation |
| 2 | Aspect |
| 3 | Slope |
| 4 | Horizontal_Distance_To_Hydrology |
| 5 | Vertical_Distance_To_Hydrology |
| 6 | Horizontal_Distance_To_Roadways |
| 7 | Hillshade_9am |
| 8 | Hillshade_Noon |
| 9 | Hillshade_3pm |
| 10 | Horizontal_Distance_To_Fire_Points |

The 44 binary wilderness-area and soil-type features were **not** scaled. The scaler was fitted on the training data only and then applied to the validation and test data, which prevents data leakage.

---

---

## Model Architecture

A fully connected feed-forward neural network built with TensorFlow and Keras.

| Layer | Configuration |
|---|---|
| Input | 54 features |
| Dense 1 | 256 neurons, ReLU |
| Dropout | 0.2 |
| Dense 2 | 128 neurons, ReLU |
| Dropout | 0.2 |
| Dense 3 | 64 neurons, ReLU |
| Output | 7 neurons, Softmax |

### Training Configuration

| Parameter | Value |
|---|---|
| Optimizer | Adam |
| Loss Function | Sparse Categorical Crossentropy |
| Evaluation Metric | Accuracy |
| Batch Size | 256 |
| Maximum Epochs | 60 |
| Early Stopping | Patience = 6, best weights restored |
| Learning Rate Scheduler | ReduceLROnPlateau |
| Dropout Rate | 0.2 |

### Training Callbacks

**EarlyStopping** monitors validation loss and stops training when it stops improving, restoring the best weights.

**ReduceLROnPlateau** lowers the learning rate when validation loss plateaus.

- Factor: 0.5
- Patience: 2
- Minimum learning rate: 0.000001

---

---

## Hyperparameter Experimentation

Four alternative configurations were tested, varying learning rate, dropout, network size, and batch size.

| Experiment | Validation Accuracy | Validation Macro F1 |
|---|---:|---:|
| Lower Learning Rate | 90.19% | 85.41% |
| Higher Dropout | 89.97% | 84.81% |
| Smaller Network | 88.02% | 80.98% |
| Larger Batch (512) | 91.79% | 87.93% |
| **Original ANN (selected)** | **92.85%** | **89.80%** |

### Final Model Selection

The original ANN outperformed all four experimental configurations on both validation accuracy and macro F1-score, so it was retained. The experiments show that a larger batch, different dropout, or a smaller network does not automatically improve results.

---

---

## Model Performance

| Metric | Validation | Test |
|---|---:|---:|
| Accuracy | 92.85% | 92.87% |
| Macro F1-Score | 89.80% | 89.45% |

### Key Observations

- The model reaches about 92.87% accuracy on unseen test data.
- Validation and test scores are very close, which suggests reasonable generalization.
- Macro F1 is lower than accuracy, which indicates that some classes are harder to predict than others. Per-class precision and recall should be reviewed before relying on the model for a specific class.
- Overall accuracy describes the model on the test set as a whole. It is not a guarantee that any single prediction is correct.

---

---

## Prediction Pipeline

The saved ANN and preprocessing artifacts form a reusable pipeline:

1. Accept 54 original, unscaled feature values.
2. Arrange features in the exact training order from the metadata.
3. Apply the saved `StandardScaler` to the 10 continuous features only.
4. Pass the processed 54-feature vector to the trained ANN.
5. Obtain probabilities for all seven classes.
6. Select the class with the highest probability.
7. Convert the output index (0-6) back to the original label (1-7) by adding 1.

### Output

- Predicted forest cover type (1-7).
- Confidence, which is the highest class probability.
- Probability distribution across all seven classes.

Probabilities are the ANN's softmax outputs and should not be read as guaranteed correctness.

---

---

## Saved Model Artifacts

| File | Description |
|---|---|
| `final_forest_cover_model.keras` | Trained TensorFlow/Keras ANN |
| `final_scaler.pkl` | Fitted StandardScaler (saved with scikit-learn 1.6.1) |
| `model_metadata.pkl` | Ordered feature names and continuous feature names |

These files allow the model and preprocessing to be restored without retraining.

**Compatibility note:** the scaler pickle was created with scikit-learn 1.6.1, so install the same version when loading it. The `.keras` file was saved with Keras 3.13.2; the web application was tested with TensorFlow 2.19 and Keras 3.15.1, which load it correctly.

---

---

## Using the Saved Model for Inference

```python
import joblib
import numpy as np
import pandas as pd
from tensorflow import keras

# Load artifacts once
model = keras.models.load_model("final_forest_cover_model.keras")
scaler = joblib.load("final_scaler.pkl")
metadata = joblib.load("model_metadata.pkl")

# Inspect the metadata to confirm the key names in your file
print(metadata.keys())

feature_names = metadata["feature_columns"]          # 54 features, training order
continuous_features = metadata["continuous_cols"]      # 10 features to scale

def predict(raw_inputs: dict):
    # Build a one-row DataFrame in the exact training order
    df = pd.DataFrame([raw_inputs])[feature_names]

    # Scale only the continuous features
    df[continuous_features] = scaler.transform(df[continuous_features])

    probabilities = model.predict(df.values.astype("float32"), verbose=0)[0]
    predicted_index = int(np.argmax(probabilities))

    return {
        "predicted_cover_type": predicted_index + 1,   # back to labels 1-7
        "confidence": float(probabilities[predicted_index]),
        "probabilities": {
            f"Cover Type {i + 1}": float(p) for i, p in enumerate(probabilities)
        },
    }
```

`model_metadata.pkl` stores the feature order under `feature_columns` and the continuous features under `continuous_cols`.

---

---

## Web Application

The trained model is served through a FastAPI backend and used by a React + TypeScript frontend.

### Application Features

- **Dashboard:** project overview, model summary (ANN, about 92.87% test accuracy, 54 inputs, 7 classes) and a start button.
- **Prediction form:** all 54 model inputs, grouped into Elevation and Terrain, Slope and Aspect, Hydrological Features, Road and Fire Distance, Hillshade Measurements, Wilderness Area and Soil Type. The form is generated from the feature list returned by the backend (`/api/features`), so names and order always come from `model_metadata.pkl`.
- **Results page:** predicted cover type, confidence, probabilities for all seven classes in a Recharts bar chart, and a note that confidence is not a guarantee of correctness.
- **About the model:** architecture, dataset, metrics and the preprocessing workflow.

### How Prediction Correctness Is Protected

- The browser sends original, unscaled values. **All preprocessing happens in Python.**
- Features are arranged in the exact order stored in `model_metadata.pkl`.
- The saved `StandardScaler` is applied to the 10 continuous features only; the 44 binary features are untouched.
- Startup checks confirm 54 features, 10 continuous features, a scaler fitted on 10 features, a model with 54 inputs and 7 outputs. If anything is inconsistent, the API reports the problem instead of guessing.
- The ANN output index (0-6) is converted to the original label (1-7) by adding 1.
- Wilderness area and soil type must each have exactly one active indicator, matching the training data. The form uses a single selector for each.

### Prerequisites

- Python 3.11 or 3.12 (3.11 recommended)
- Node.js 18 or newer
- The three model artifacts, already included in `backend/model/`:
  `final_forest_cover_model.keras`, `final_scaler.pkl`, `model_metadata.pkl`

### Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # optional
python scripts/verify_artifacts.py # checks that the three artifacts load and agree
uvicorn app.main:app --reload --port 8000
```

`scikit-learn` is pinned to 1.6.1 because the scaler was saved with that version. Interactive API docs are served at `http://localhost:8000/docs`.

The backend reads the keys `feature_columns` and `continuous_cols` from `model_metadata.pkl` (a few common alternative names are also accepted). If you replace the metadata file with one that uses other key names, set `METADATA_FEATURES_KEY` and `METADATA_CONTINUOUS_KEY` in `backend/.env`; the error message lists the keys it found.

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env               # sets VITE_API_URL=http://localhost:8000
npm run dev                        # http://localhost:5173
```

### Running Locally

1. Start the backend (port 8000).
2. Start the frontend (port 5173).
3. Open `http://localhost:5173` and choose **Start a prediction**.

The header badge shows whether the backend is reachable and the model is loaded.

### API Documentation

Base URL: `http://localhost:8000`

**`GET /api/health`** - service and artifact status.

```json
{ "status": "ok", "api_running": true, "model_loaded": true,
  "artifacts": { "model": true, "scaler": true, "metadata": true },
  "feature_count": 54, "detail": null }
```

`status` is `"degraded"` and `detail` explains the problem when an artifact fails to load.

**`GET /api/features`** - the 54 feature names in model order, the 10 continuous feature names, per-feature labels, descriptions, units, ranges and example defaults, and the form groups.

**`POST /api/predict`** - body:

```json
{ "features": { "Elevation": 2800, "Aspect": 120, "...": "all 54 features, original unscaled values" } }
```

Response:

```json
{
  "predicted_cover_type": 2,
  "predicted_cover_type_name": "Lodgepole Pine",
  "confidence": 0.91,
  "probabilities": { "Cover Type 1": 0.05, "Cover Type 2": 0.91, "...": "..." },
  "warnings": []
}
```

(Values above are illustrative only; real values come from the trained ANN.) `warnings` lists inputs outside the range seen in the training data.

Validation errors return HTTP 422:

```json
{ "detail": "Some input values are missing or invalid.",
  "errors": [ { "field": "Elevation", "message": "Required feature is missing." } ] }
```

| Status | Meaning |
|---|---|
| 200 | Prediction returned |
| 422 | Missing, unknown, non-numeric or out-of-range inputs, or a body in the wrong format |
| 503 | Model artifacts are not loaded (see `/api/health`) |
| 500 | Unexpected server error |

### Testing

```bash
cd backend
pip install -r requirements-dev.txt
pytest -v
```

- `tests/test_pipeline.py` checks the pipeline code (feature order, scaling only the 10 continuous features, the API contract, validation errors, missing-artifact handling). It runs against a small throw-away model generated in a temporary folder, so it tests the code, not your model.
- `tests/test_real_artifacts.py` runs against your real files in `backend/model/` and is skipped if they are absent. It checks that they load, that 54 features are returned, and that predictions return a class from 1 to 7 with probabilities summing to about 1.
- To confirm the backend matches your Colab pipeline exactly, export reference samples as described in `backend/tests/data/README.md`. The test `test_matches_colab_reference` then compares predicted classes and probabilities.

Frontend type check and production build: `cd frontend && npm run build`.

### Deployment

**Backend on Render**

1. Push this repository to GitHub. The three model files are in `backend/model/` and must be committed (the `.keras` file is about 0.7 MB, so Git LFS is not required).
2. Create a Web Service from the repository. You can use the included `render.yaml` blueprint, or set manually: root directory `backend`, build command `pip install -r requirements.txt`, start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, health check path `/api/health`.
3. Set `PYTHON_VERSION=3.11.9`.
4. Set `CORS_ORIGINS` to your frontend URL, for example `https://your-app.vercel.app`. For Vercel preview URLs you can also set `CORS_ORIGIN_REGEX=https://.*\.vercel\.app`.
5. Choose an instance with enough memory. TensorFlow needs roughly 1 GB or more at runtime; free tiers with 512 MB are likely to fail. The model loads once at startup, so the first start can take a minute.

**Frontend on Vercel**

1. Import the repository in Vercel and set the root directory to `frontend` (framework preset: Vite).
2. Add the environment variable `VITE_API_URL` with your Render URL (no trailing slash), for example `https://your-api.onrender.com`.
3. Deploy. `vercel.json` rewrites all routes to `index.html` so page refreshes work.
4. If you change the Vercel URL later, update `CORS_ORIGINS` on Render and redeploy the backend.

Environment files are ignored by Git; only `.env.example` files are committed. No secrets are required.

### Screenshots

Add screenshots to `docs/screenshots/` and reference them here:

```markdown
![Dashboard](docs/screenshots/dashboard.png)
![Prediction form](docs/screenshots/predict.png)
![Results](docs/screenshots/results.png)
```

### Troubleshooting

| Problem | Likely cause and fix |
|---|---|
| Header shows "Service offline" | Backend not running, or `VITE_API_URL` is wrong. Restart the frontend after changing `.env`. |
| Header shows "Model not loaded" | Open `/api/health` and read `detail`. Usually a missing artifact or metadata key mismatch. |
| Browser CORS error | Add the frontend origin to `CORS_ORIGINS` on the backend. |
| Scaler fails to load | Install `scikit-learn==1.6.1`. |
| Model fails to load | Use the pinned TensorFlow version, or the version used in Colab when the model was saved. |

---

## Technologies Used

| Technology | Purpose |
|---|---|
| Python | Programming language |
| TensorFlow | ANN development and training |
| Keras | Neural network API |
| Pandas | Data manipulation |
| NumPy | Numerical operations |
| Scikit-learn | Preprocessing and evaluation |
| Joblib | Saving and loading artifacts |
| Matplotlib | Data visualization |
| Seaborn | Exploratory data visualization |
| Google Colab | Model development and experimentation |
| Git and GitHub | Version control |

---
| FastAPI, Pydantic, Uvicorn | REST API and request validation |
| React, TypeScript, Vite | Frontend application |
| Tailwind CSS | Styling |
| Recharts | Probability charts |
| React Hook Form | Form handling and validation |
| Lucide React | Icons |
| Pytest | Backend tests |

---

## Repository Structure

```text
Forest-Cover-Type-Prediction/
|-- README.md
|-- .gitignore
|-- render.yaml                          # Render blueprint for the API
|-- The_Forest_Cover_Type_Prediction_TF.ipynb   # (optional) Colab notebook with the full ML workflow
|-- backend/
|   |-- app/
|   |   |-- main.py                      # FastAPI app, CORS, startup model loading
|   |   |-- routes/api.py                # /api/health, /api/features, /api/predict
|   |   |-- services/model_service.py    # artifact loading, validation, preprocessing, prediction
|   |   |-- schemas/prediction.py        # Pydantic models
|   |   `-- core/                        # settings, exceptions, feature catalog
|   |-- model/                           # final_forest_cover_model.keras, final_scaler.pkl, model_metadata.pkl
|   |-- scripts/verify_artifacts.py
|   |-- tests/
|   |-- requirements.txt
|   `-- .env.example
|-- frontend/
|   |-- src/                             # pages, components, API client
|   |-- package.json
|   |-- vercel.json
|   `-- .env.example
`-- docs/screenshots/
```

---

## Reproducing the Model (Notebook)

### 1. Clone the Repository

```bash
git clone https://github.com/sawan-kush/Forest-Cover-Type-Prediction-TensorFlow-.git
cd Forest-Cover-Type-Prediction-TensorFlow-
```

### 2. Install Dependencies

```bash
pip install tensorflow pandas numpy scikit-learn==1.6.1 matplotlib seaborn joblib
```

### 3. Open the Notebook

Open `The_Forest_Cover_Type_Prediction_TF.ipynb` in Google Colab or Jupyter Notebook.

### 4. Download the Dataset

Download the dataset from Kaggle and set its path in the notebook.

### 5. Run the Notebook

Run the cells in order to reproduce preprocessing, training, experiments, and evaluation.

**Note:** if you only need predictions, skip steps 3 to 5 and load the saved artifacts directly, as shown in [Using the Saved Model for Inference](#using-the-saved-model-for-inference) or run the [Web Application](#web-application).

---

---

## Limitations

- The model was trained on a single dataset from a specific geographic region, so it may not generalize to other regions.
- Accuracy varies between classes; macro F1 is below overall accuracy.
- Predictions are probabilistic and should support, not replace, field verification.
- Input values should fall within realistic ranges seen in the training data. Values far outside it may give unreliable results.

---

---

## Future Improvements

- Model interpretability and feature importance analysis.
- Improved performance on classes with lower recall.
- Batch predictions from CSV upload.
- Automated frontend tests and CI.

---

## Author

**Sawan Kushwah**
AI and Machine Learning Undergraduate
GitHub: [sawan-kush](https://github.com/sawan-kush)

---

---

## Acknowledgements

- Kaggle and the UCI ML community for the Forest Cover Type dataset.
- TensorFlow and Keras for the deep learning tools.
- Scikit-learn for preprocessing and evaluation utilities.

If you find this project useful, consider giving the repository a star on GitHub.
