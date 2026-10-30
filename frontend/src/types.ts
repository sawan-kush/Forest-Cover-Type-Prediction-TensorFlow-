export type FeatureKind = "continuous" | "binary";

export interface FeatureInfo {
  name: string;
  kind: FeatureKind;
  group: string;
  label: string;
  /** Optional group heading (used to organise the soil dropdown). */
  category?: string;
  description: string;
  unit?: string;
  default: number;
  hard_min?: number;
  hard_max?: number;
  typical_min?: number;
  typical_max?: number;
}

export interface FeatureGroup {
  id: string;
  title: string;
  description: string;
  input_type: "number" | "one_hot";
  feature_names: string[];
}

export interface FeaturesResponse {
  feature_count: number;
  feature_names: string[];
  continuous_features: string[];
  features: FeatureInfo[];
  groups: FeatureGroup[];
  class_names: Record<string, string>;
}

export interface PredictionResult {
  predicted_cover_type: number;
  predicted_cover_type_name: string;
  confidence: number;
  probabilities: Record<string, number>;
  warnings: string[];
}

export interface HealthResponse {
  status: "ok" | "degraded";
  api_running: boolean;
  model_loaded: boolean;
  artifacts: Record<string, boolean>;
  feature_count: number;
  detail?: string | null;
}

export interface FieldError {
  field: string;
  message: string;
}

/** One line of the "your site" summary shown on the results page. */
export interface SiteItem {
  key: string;
  group: string;
  label: string;
  value: number | string;
  unit?: string;
}