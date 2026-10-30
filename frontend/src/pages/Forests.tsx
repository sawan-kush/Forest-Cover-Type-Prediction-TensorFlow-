import { ArrowRight, Mountain } from "lucide-react";
import { Link } from "react-router-dom";
import ForestImage from "../components/ForestImage";
import Reveal from "../components/Reveal";
import { FORESTS, getForest } from "../lib/forestData";

export default function Forests() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-forest-950 text-white">
        <ForestImage forest={getForest(1)!} className="absolute inset-0 -z-10" eager alt="" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest-950 via-forest-950/80 to-forest-950/30" />
        <div className="wrap py-20 lg:py-32">
          <p className="eyebrow !text-forest-300">Forest types</p>
          <h1 className="mt-3 max-w-4xl text-5xl font-semibold leading-tight sm:text-6xl">Seven forests, from valley streams to the treeline</h1>
          <p className="mt-5 max-w-2xl text-lg text-forest-100">
            Each forest has its own trees, climate and role in the landscape. Explore them below, or identify one from your own site.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {FORESTS.map((f) => (
              <a key={f.id} href={`#forest-${f.id}`} className="rounded-full border border-white/30 px-4 py-1.5 text-sm text-white backdrop-blur transition-colors hover:bg-white/15">
                {f.id}. {f.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {FORESTS.map((f, i) => (
        <section key={f.id} id={`forest-${f.id}`} className={`scroll-mt-16 ${i % 2 ? "bg-cream" : "bg-paper"}`}>
          <div className="wrap grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-20 lg:py-24">
            <Reveal className={i % 2 ? "lg:order-2" : ""}>
              <ForestImage forest={f} className="aspect-[4/3] rounded-3xl shadow-lift" />
            </Reveal>
            <Reveal delay={120}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: f.accent }}>Type {f.id} · {f.zone}</p>
              <h2 className="mt-2 text-4xl font-semibold sm:text-5xl">{f.name}</h2>
              <p className="mt-2 text-sm italic text-sage-500">{f.scientificName}</p>
              <p className="mt-5 text-lg leading-relaxed text-forest-800">{f.description}</p>
              <dl className="mt-6 space-y-4 text-sm leading-relaxed">
                <div>
                  <dt className="font-semibold">Where it grows</dt>
                  <dd className="text-forest-800">{f.distribution}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 font-semibold"><Mountain size={14} aria-hidden /> Elevation</dt>
                  <dd className="text-forest-800">{f.elevation}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Ecology</dt>
                  <dd className="text-forest-800">{f.ecologicalImportance}</dd>
                </div>
              </dl>
              <Link to={`/forests/${f.id}`} className="btn-primary mt-8">
                Explore more details <ArrowRight size={16} aria-hidden />
              </Link>
            </Reveal>
          </div>
        </section>
      ))}
    </>
  );
}