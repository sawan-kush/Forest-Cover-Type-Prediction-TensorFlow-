import { AlertTriangle, ArrowRight, Compass, Info, MapPinOff, Mountain, RotateCcw, Sun, TrendingUp } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import ForestImage from "../components/ForestImage";
import ForestInfo from "../components/ForestInfo";
import ProbabilityBars from "../components/ProbabilityBars";
import Reveal from "../components/Reveal";
import { compass, fmtNumber, pct } from "../lib/format";
import { getForest } from "../lib/forestData";
import { useResult } from "../lib/ResultContext";
import type { SiteItem } from "../types";

const num = (site: SiteItem[], key: string): number | undefined => {
  const v = site.find((s) => s.key === key)?.value;
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
};

function elevationBand(m: number): string {
  if (m < 2000) return "a low, foothill-level elevation for the Colorado Rockies";
  if (m < 2700) return "a montane elevation for the Colorado Rockies";
  if (m < 3400) return "a subalpine elevation for the Colorado Rockies";
  return "a high elevation, near or above the treeline in the Colorado Rockies";
}

function slopeClass(d: number): string {
  if (d < 10) return "gentle";
  if (d < 25) return "moderate";
  if (d < 40) return "steep";
  return "very steep";
}

function sunClass(noon: number): string {
  if (noon >= 220) return "well lit at midday";
  if (noon >= 180) return "moderately lit at midday";
  return "shaded at midday";
}

export default function Results() {
  const { result, site } = useResult();
  const forest = result ? getForest(result.predicted_cover_type) : undefined;
  if (!result || !forest) return <Navigate to="/predict" replace />;

  const elevation = num(site, "Elevation");
  const slope = num(site, "Slope");
  const aspect = num(site, "Aspect");
  const noon = num(site, "Hillshade_Noon");
  const wilderness = site.find((s) => s.key === "wilderness");
  const soil = site.find((s) => s.key === "soil");

  const traits = [
    elevation !== undefined && { icon: Mountain, title: "Elevation", text: `${fmtNumber(elevation)} m — ${elevationBand(elevation)}.` },
    slope !== undefined && { icon: TrendingUp, title: "Terrain", text: `A ${slopeClass(slope)} slope of ${fmtNumber(slope)}°.` },
    aspect !== undefined && { icon: Compass, title: "Slope direction", text: `Faces ${compass(aspect)} (${fmtNumber(aspect)}°).` },
    noon !== undefined && { icon: Sun, title: "Sunlight", text: `The site is ${sunClass(noon)} (noon hillshade ${fmtNumber(noon)} of 255).` },
  ].filter(Boolean) as { icon: typeof Mountain; title: string; text: string }[];

  return (
    <>
      {/* A. Predicted forest */}
      <section className="relative isolate flex min-h-[78svh] items-end overflow-hidden bg-forest-950 text-white">
        <ForestImage forest={forest} className="absolute inset-0 -z-10" eager zoom />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-950/95 via-forest-950/50 to-forest-950/15" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest-950/70 via-forest-950/20 to-transparent" />
        <div className="wrap grid gap-10 pb-14 pt-32 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="animate-fadeUp">
            <p className="eyebrow !text-forest-300">Forest identification report</p>
            <p className="mt-4 text-lg text-forest-100">Type {result.predicted_cover_type}</p>
            <h1 className="text-5xl font-semibold leading-tight sm:text-7xl">{forest.name}</h1>
            <p className="mt-2 text-sm italic text-forest-200">{forest.scientificName}</p>
            <p className="mt-5 max-w-3xl text-xl leading-relaxed text-forest-50">{forest.description}</p>
          </div>
          <div className="animate-fadeUp rounded-3xl border border-white/20 bg-white/10 p-7 backdrop-blur-md lg:min-w-[20rem]" style={{ animationDelay: "200ms" }}>
            <p className="text-sm uppercase tracking-widest text-forest-200">Prediction</p>
            <p className="mt-1 font-serif text-4xl font-semibold sm:text-5xl">Confidence: {pct(result.confidence)}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-forest-300" style={{ width: `${Math.min(100, result.confidence * 100)}%` }} />
            </div>
          </div>
        </div>
      </section>

      <div className="bg-bark-100">
        <div className="wrap flex gap-3 py-4 text-sm leading-relaxed text-bark-700">
          <Info size={18} className="mt-0.5 shrink-0" aria-hidden />
          <p>Confidence is a predicted probability for this forest type. It is not a guarantee that the identification is correct.</p>
        </div>
      </div>

      {result.warnings.length > 0 && (
        <div className="wrap pt-8">
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900" role="alert">
            <p className="flex items-center gap-2 font-semibold"><AlertTriangle size={16} aria-hidden /> Some values are unusual</p>
            <p className="mt-1">One or more of the values you entered are outside the typical range for these forests, so this result may be less reliable.</p>
          </div>
        </div>
      )}

      {/* B. About this forest */}
      <section className="bg-paper py-20">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">About this forest</p>
            <h2 className="mb-10 mt-3 text-4xl font-semibold">{forest.tagline}</h2>
          </Reveal>
          <Reveal delay={80}><ForestInfo forest={forest} /></Reveal>
        </div>
      </section>

      {/* C. Probabilities */}
      <section className="bg-cream py-20">
        <div className="wrap grid gap-12 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <p className="eyebrow">Prediction probabilities</p>
            <h2 className="mt-3 text-4xl font-semibold">How the seven forest types compare</h2>
            <p className="mt-4 leading-relaxed text-forest-800">
              Each bar shows how strongly your site matches that forest type. The predicted type is highlighted. Confidence is a
              predicted probability and not a guarantee, so when two forest types score closely, treat the result with extra care.
            </p>
          </Reveal>
          <Reveal delay={100} className="card p-6 sm:p-8 lg:col-span-3">
            <ProbabilityBars probabilities={result.probabilities} predicted={result.predicted_cover_type} />
          </Reveal>
        </div>
      </section>

      {/* D. Your site */}
      <section className="bg-paper py-20">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">Your site</p>
            <h2 className="mb-10 mt-3 text-4xl font-semibold">What you entered</h2>
          </Reveal>

          {traits.length > 0 && (
            <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {traits.map(({ icon: Icon, title, text }, i) => (
                <Reveal key={title} delay={i * 80}>
                  <div className="h-full rounded-2xl bg-forest-900 p-6 text-white">
                    <Icon size={22} className="text-forest-300" aria-hidden />
                    <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-forest-200">{title}</p>
                    <p className="mt-1 leading-relaxed">{text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          )}

          <Reveal className="card p-6 sm:p-8">
            <dl className="grid gap-x-10 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
              {site.map((s) => (
                <div key={s.key} className="border-b border-sage-100 pb-3">
                  <dt className="text-xs font-semibold uppercase tracking-widest text-sage-500">{s.label}</dt>
                  <dd className="mt-1 font-medium">
                    {typeof s.value === "number" ? fmtNumber(s.value) : s.value}
                    {s.unit && typeof s.value === "number" && !s.unit.startsWith("index") ? <span className="text-sage-500"> {s.unit}</span> : null}
                  </dd>
                </div>
              ))}
            </dl>
            {(wilderness || soil) && (
              <p className="mt-5 text-sm text-forest-800">
                Selected area: <strong>{wilderness?.value ?? "—"}</strong> · Soil: <strong>{soil?.value ?? "—"}</strong>
              </p>
            )}
            <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-sage-500">
              <MapPinOff size={14} className="mt-0.5 shrink-0" aria-hidden />
              This report is based only on the measurements you entered. It does not identify an actual geographical location.
            </p>
          </Reveal>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/predict" className="btn-primary"><RotateCcw size={16} aria-hidden /> Make another prediction</Link>
            <Link to={`/forests/${forest.id}`} className="btn-secondary">Explore more about {forest.name} <ArrowRight size={16} aria-hidden /></Link>
          </div>
        </div>
      </section>
    </>
  );
}