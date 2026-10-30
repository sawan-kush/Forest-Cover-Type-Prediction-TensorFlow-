import { AlertCircle, Compass, Droplets, Layers, Loader2, MapPin, Mountain, RotateCcw, Route, ScanSearch, Sun, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import ForestImage from "../components/ForestImage";
import NumberField from "../components/NumberField";
import OneHotGroup from "../components/OneHotGroup";
import { ApiError, getFeatures, predict } from "../lib/api";
import { getForest } from "../lib/forestData";
import { useResult } from "../lib/ResultContext";
import type { FeatureGroup, FeatureInfo, FeaturesResponse, FieldError, SiteItem } from "../types";

type Values = Record<string, number | string | boolean>;

const GROUP_ICONS: Record<string, LucideIcon> = {
  elevation: Mountain,
  slope_aspect: Compass,
  hydrology: Droplets,
  distance: Route,
  hillshade: Sun,
  wilderness: MapPin,
  soil: Layers,
};

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

/** Readable summary of what the user entered, shown on the results page. */
function buildSite(data: FeaturesResponse, values: Values): SiteItem[] {
  const items: SiteItem[] = [];
  for (const g of data.groups) {
    const feats = data.features.filter((f) => g.feature_names.includes(f.name));
    if (g.input_type === "one_hot") {
      const sel = feats.find((f) => f.name === values[`oh_${g.id}`]);
      items.push({ key: g.id, group: g.id, label: g.title, value: sel ? sel.label : "Not selected" });
    } else {
      for (const f of feats)
        if (f.kind === "continuous") items.push({ key: f.name, group: g.id, label: f.label, value: Number(values[f.name]), unit: f.unit });
    }
  }
  return items;
}

export default function Predict() {
  const [data, setData] = useState<FeaturesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setError(null);
    getFeatures().then(setData).catch((e: ApiError) => {
      console.error(e);
      setError(e.message);
    });
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  if (error)
    return (
      <div className="wrap py-24">
        <div className="card mx-auto max-w-xl p-8 text-center" role="alert">
          <h1 className="text-2xl font-semibold">The prediction service is not available</h1>
          <p className="mt-3 text-sm leading-relaxed text-forest-800">
            ForestSphere could not reach its prediction service. It may be starting up, so please wait a moment and try again.
          </p>
          {import.meta.env.DEV && <p className="mt-3 rounded-lg bg-sage-100 p-3 text-left text-xs text-sage-500">Dev detail: {error}</p>}
          <button className="btn-primary mt-6" onClick={load}>Try again</button>
        </div>
      </div>
    );
  if (!data)
    return (
      <div className="flex items-center justify-center gap-2 py-40 text-forest-800" role="status">
        <Loader2 className="animate-spin" size={18} aria-hidden /> Preparing the site form
      </div>
    );
  return <PredictForm data={data} />;
}

function PredictForm({ data }: { data: FeaturesResponse }) {
  const navigate = useNavigate();
  const { setReport } = useResult();
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
      setReport({ result, site: buildSite(data, values) });
      navigate("/results");
    } catch (e) {
      const err = e as ApiError;
      setApiError({ message: err.message, fields: err.fieldErrors ?? [] });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const groupErrorCount = (g: FeatureGroup) => g.feature_names.filter((n) => errors[n]).length;
  const heroForest = getForest(2)!;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="pb-28">
        <section className="relative isolate overflow-hidden bg-forest-950 text-white">
          <ForestImage forest={heroForest} className="absolute inset-0 -z-10" eager alt="" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest-950 via-forest-950/80 to-forest-950/30" />
          <div className="wrap py-16 lg:py-24">
            <p className="eyebrow !text-forest-300">Forest identification</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">Describe your site</h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-forest-100">
              Enter the terrain and surroundings of a location and ForestSphere will identify the most likely forest cover type.
              The form starts with example values, so replace them with your own measurements.
            </p>
          </div>
        </section>

        <div className="wrap pt-10">
          {apiError && (
            <div className="mb-8 rounded-2xl border border-red-300 bg-red-50 p-5 text-sm text-red-900" role="alert">
              <p className="flex items-center gap-2 font-semibold"><AlertCircle size={16} aria-hidden /> {apiError.message}</p>
              {apiError.fields.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {apiError.fields.map((f, i) => <li key={i}>{labelFor(f.field)}: {f.message}</li>)}
                </ul>
              )}
            </div>
          )}

          <div className="grid gap-10 lg:grid-cols-[17rem_1fr]">
            <nav aria-label="Form sections" className="lg:sticky lg:top-24 lg:self-start">
              <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
                {data.groups.map((g, i) => {
                  const n = groupErrorCount(g);
                  const Icon = GROUP_ICONS[g.id] ?? Layers;
                  return (
                    <li key={g.id} className="shrink-0">
                      <a href={`#section-${g.id}`} className="flex items-center gap-3 whitespace-nowrap rounded-xl border border-sage-200 bg-white px-4 py-2.5 text-sm font-medium text-forest-800 transition-colors hover:bg-forest-50 lg:border-0 lg:bg-transparent">
                        <Icon size={16} className="text-forest-600" aria-hidden />
                        <span className="text-sage-500">{i + 1}.</span> {g.title}
                        {n > 0 && <span className="rounded-full bg-red-100 px-1.5 text-xs font-semibold text-red-700">{n}</span>}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="space-y-6">
              {data.groups.map((g, i) => {
                const feats = g.feature_names.map((n) => featureByName.get(n) as FeatureInfo);
                const Icon = GROUP_ICONS[g.id] ?? Layers;
                return (
                  <section key={g.id} id={`section-${g.id}`} className="card scroll-mt-24 p-6 sm:p-8" aria-labelledby={`h-${g.id}`}>
                    <div className="mb-6 flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-800 text-forest-100">
                        <Icon size={20} aria-hidden />
                      </span>
                      <div>
                        <h2 id={`h-${g.id}`} className="text-2xl font-semibold">{i + 1}. {g.title}</h2>
                        <p className="mt-1 text-sm text-sage-500">{g.description}</p>
                      </div>
                    </div>
                    {g.input_type === "one_hot" ? (
                      <OneHotGroup group={g} features={feats} />
                    ) : (
                      <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
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
        </div>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sage-200 bg-paper/95 backdrop-blur">
          <div className="wrap flex items-center justify-end gap-3 py-3">
            <button type="button" className="btn-secondary" onClick={() => { reset(defaults); setApiError(null); }} disabled={isSubmitting}>
              <RotateCcw size={16} aria-hidden /> Reset
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <ScanSearch size={16} aria-hidden />}
              {isSubmitting ? "Identifying forest" : "Identify forest type"}
            </button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}