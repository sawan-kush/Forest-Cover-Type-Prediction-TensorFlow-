import { AlertCircle, Loader2, RotateCcw, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import NumberField from "../components/NumberField";
import OneHotGroup from "../components/OneHotGroup";
import { ApiError, getFeatures, predict } from "../lib/api";
import { useResult } from "../lib/ResultContext";
import type { FeatureGroup, FeatureInfo, FeaturesResponse, FieldError } from "../types";

type Values = Record<string, number | string | boolean>;

function buildDefaults(data: FeaturesResponse): Values {
  const values: Values = {};
  for (const g of data.groups) {
    const feats = data.features.filter((f) => g.feature_names.includes(f.name));
    if (g.input_type === "one_hot") {
      values[`oh_${g.id}`] = (feats.find((f) => f.default === 1) ?? feats[0]).name;
    } else {
      for (const f of feats) values[f.name] = f.kind === "binary" ? f.default === 1 : f.default;
    }
  }
  return values;
}

function buildPayload(data: FeaturesResponse, values: Values): Record<string, number> {
  const groupById = new Map(data.groups.map((g) => [g.id, g]));
  const payload: Record<string, number> = {};
  for (const f of data.features) {
    const g = groupById.get(f.group) as FeatureGroup;
    if (g.input_type === "one_hot") payload[f.name] = values[`oh_${g.id}`] === f.name ? 1 : 0;
    else if (f.kind === "continuous") payload[f.name] = Number(values[f.name]);
    else payload[f.name] = values[f.name] ? 1 : 0;
  }
  return payload;
}

export default function Predict() {
  const [data, setData] = useState<FeaturesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    getFeatures().then(setData).catch((e: ApiError) => setError(e.message));
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  if (error)
    return (
      <div className="card mx-auto max-w-xl p-6" role="alert">
        <h1 className="text-xl font-semibold">The prediction service is not available</h1>
        <p className="mt-2 text-sm text-forest-800">{error}</p>
        <p className="mt-2 text-sm text-sage-500">
          Start the backend with <code className="rounded bg-sage-100 px-1">uvicorn app.main:app --reload</code> from the backend folder and check that the model files are in <code className="rounded bg-sage-100 px-1">backend/model</code>.
        </p>
        <button className="btn-primary mt-4" onClick={load}>Try again</button>
      </div>
    );
  if (!data)
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-forest-800" role="status">
        <Loader2 className="animate-spin" size={18} aria-hidden /> Loading the feature list
      </div>
    );
  return <PredictForm data={data} />;
}

function PredictForm({ data }: { data: FeaturesResponse }) {
  const navigate = useNavigate();
  const { setResult } = useResult();
  const defaults = useMemo(() => buildDefaults(data), [data]);
  const methods = useForm<Values>({ defaultValues: defaults, mode: "onTouched" });
  const { handleSubmit, reset, formState: { errors, isSubmitting } } = methods;
  const [apiError, setApiError] = useState<{ message: string; fields: FieldError[] } | null>(null);

  const featureByName = useMemo(() => new Map(data.features.map((f) => [f.name, f])), [data]);
  const labelFor = (field: string) => featureByName.get(field)?.label ?? field;

  const onSubmit = async (values: Values) => {
    setApiError(null);
    try {
      const result = await predict(buildPayload(data, values));
      setResult(result);
      navigate("/results");
    } catch (e) {
      const err = e as ApiError;
      setApiError({ message: err.message, fields: err.fieldErrors ?? [] });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const groupErrorCount = (g: FeatureGroup) =>
    g.feature_names.filter((n) => errors[n]).length;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="pb-24">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold sm:text-4xl">Forest cover prediction</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-forest-800">
            Describe the site. All {data.feature_count} model inputs are collected here as original measurements; scaling
            happens on the server. The form is prefilled with example values close to the dataset averages, so replace
            them with your own measurements.
          </p>
        </header>

        {apiError && (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-5 text-sm text-red-900" role="alert">
            <p className="flex items-center gap-2 font-semibold"><AlertCircle size={16} aria-hidden /> {apiError.message}</p>
            {apiError.fields.length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {apiError.fields.map((f, i) => <li key={i}>{labelFor(f.field)}: {f.message}</li>)}
              </ul>
            )}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[14rem_1fr]">
          <nav aria-label="Form sections" className="lg:sticky lg:top-24 lg:self-start">
            <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0">
              {data.groups.map((g) => {
                const n = groupErrorCount(g);
                return (
                  <li key={g.id} className="shrink-0">
                    <a href={`#section-${g.id}`} className="flex items-center justify-between gap-2 whitespace-nowrap rounded-md border border-sage-200 bg-white px-3 py-1.5 text-sm text-forest-800 hover:bg-sage-100 lg:border-0 lg:bg-transparent">
                      {g.title}
                      {n > 0 && <span className="rounded-full bg-red-100 px-1.5 text-xs font-semibold text-red-700">{n}</span>}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="space-y-6">
            {data.groups.map((g) => {
              const feats = g.feature_names.map((n) => featureByName.get(n) as FeatureInfo);
              return (
                <section key={g.id} id={`section-${g.id}`} className="card scroll-mt-24 p-5 sm:p-6" aria-labelledby={`h-${g.id}`}>
                  <h2 id={`h-${g.id}`} className="text-xl font-semibold">{g.title}</h2>
                  <p className="mb-5 mt-1 text-sm text-sage-500">{g.description}</p>
                  {g.input_type === "one_hot" ? (
                    <OneHotGroup group={g} features={feats} />
                  ) : (
                    <div className="grid gap-5 sm:grid-cols-2">
                      {feats.map((f) =>
                        f.kind === "continuous" ? (
                          <NumberField key={f.name} feature={f} />
                        ) : (
                          <label key={f.name} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" className="accent-forest-700" {...methods.register(f.name)} /> {f.label}
                          </label>
                        ),
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-sage-200 bg-paper/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-4 py-3 sm:px-6">
            <button type="button" className="btn-secondary" onClick={() => { reset(defaults); setApiError(null); }} disabled={isSubmitting}>
              <RotateCcw size={16} aria-hidden /> Reset
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Sparkles size={16} aria-hidden />}
              {isSubmitting ? "Predicting" : "Predict cover type"}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}