import { ArrowLeft, ArrowRight, ScanSearch } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import ForestImage from "../components/ForestImage";
import ForestInfo from "../components/ForestInfo";
import { FORESTS, getForest } from "../lib/forestData";

export default function ForestDetail() {
  const { id } = useParams();
  const forest = getForest(Number(id));
  if (!forest) return <Navigate to="/forests" replace />;

  const index = FORESTS.findIndex((f) => f.id === forest.id);
  const prev = FORESTS[(index + FORESTS.length - 1) % FORESTS.length];
  const next = FORESTS[(index + 1) % FORESTS.length];

  return (
    <>
      <section className="relative isolate flex min-h-[70svh] items-end overflow-hidden bg-forest-950 text-white">
        <ForestImage forest={forest} className="absolute inset-0 -z-10" eager zoom />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-950 via-forest-950/50 to-forest-950/10" />
        <div className="wrap pb-14 pt-28">
          <Link to="/forests" className="mb-6 inline-flex items-center gap-2 text-sm text-forest-100 hover:text-white">
            <ArrowLeft size={16} aria-hidden /> All forest types
          </Link>
          <p className="eyebrow !text-forest-300">Type {forest.id} · {forest.zone}</p>
          <h1 className="mt-2 text-5xl font-semibold leading-tight sm:text-7xl">{forest.name}</h1>
          <p className="mt-3 text-sm italic text-forest-200">{forest.scientificName}</p>
          <p className="mt-5 max-w-3xl text-xl leading-relaxed text-forest-50">{forest.description}</p>
        </div>
      </section>

      <section className="bg-paper py-20">
        <div className="wrap">
          <p className="eyebrow">About this forest</p>
          <h2 className="mb-10 mt-3 text-4xl font-semibold">{forest.tagline}</h2>
          <ForestInfo forest={forest} />
        </div>
      </section>

      <section className="bg-forest-900 py-16 text-white">
        <div className="wrap flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap gap-3">
            <Link to={`/forests/${prev.id}`} className="btn-ghost-light"><ArrowLeft size={16} aria-hidden /> {prev.name}</Link>
            <Link to={`/forests/${next.id}`} className="btn-ghost-light">{next.name} <ArrowRight size={16} aria-hidden /></Link>
          </div>
          <Link to="/predict" className="btn-light"><ScanSearch size={16} aria-hidden /> Identify a forest</Link>
        </div>
      </section>
    </>
  );
}