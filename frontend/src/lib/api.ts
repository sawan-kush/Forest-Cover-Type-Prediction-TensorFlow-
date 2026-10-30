import type { FeaturesResponse, FieldError, HealthResponse, PredictionResult } from "../types";

export const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  fieldErrors: FieldError[];
  constructor(message: string, status: number, fieldErrors: FieldError[] = []) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new ApiError(
      `Cannot reach the prediction service at ${API_URL}. Make sure the backend is running and VITE_API_URL is correct.`,
      0,
    );
  }
  if (!res.ok) {
    let detail = `Request failed (${res.status}).`;
    let errors: FieldError[] = [];
    try {
      const body = await res.json();
      if (typeof body.detail === "string") detail = body.detail;
      if (Array.isArray(body.errors)) errors = body.errors;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(detail, res.status, errors);
  }
  return res.json() as Promise<T>;
}

export const getHealth = () => request<HealthResponse>("/api/health");
export const getFeatures = () => request<FeaturesResponse>("/api/features");
export const predict = (features: Record<string, number>) =>
  request<PredictionResult>("/api/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ features }),
  });
