import { ArrowRight, BookOpen, Droplets, Flame, Leaf, ScanSearch, SlidersHorizontal, Sprout, TreePine } from "lucide-react";
import { Link } from "react-router-dom";
import ForestImage from "../components/ForestImage";
import Reveal from "../components/Reveal";
import { FORESTS, getForest } from "../lib/forestData";

const stats = [
  { value: "7", label: "Forest cover types" },
  { value: "4", label: "Wilderness areas: Rawah, Neota, Comanche Peak, Cache la Poudre" },
  { value: "1,859–3,858 m", label: "Elevation span covered" },
];

const steps = [
  { icon: SlidersHorizontal, title: "Describe a site", text: "Enter its elevation, slope, nearby water and roads, sunlight, wilderness area and soil type." },
  { icon: ScanSearch, title: "Identify the forest", text: "ForestSphere returns the most likely cover type, with its confidence and the odds for all seven types." },
  { icon: BookOpen, title: "Learn about it", text: "Read a detailed report: where the forest grows, its climate, its ecology and surprising facts." },
];

const uses = [
  { icon: Droplets, title: "Water and watersheds", text: "Forest type affects how snow is held, how fast it melts and how much water reaches streams." },
  { icon: Flame, title: "Wildfire planning", text: "Different forests burn in different ways. Knowing the type helps land managers plan for fire." },
  { icon: Leaf, title: "Wildlife habitat", text: "Each forest supports its own community of animals, from lynx in spruce-fir to birds in cottonwood corridors." },
  { icon: Sprout, title: "Conservation and learning", text: "Mapping forest types helps track change over time and helps students and hikers understand the landscape." },
];

const mosaic = [
  { id: 5, cls: "md:col-span-7 md:row-span-2" },
  { id: 1, cls: "md:col-span-5" },
  { id: 7, cls: "md:col-span-5" },
  { id: 2, cls: "md:col-span-4" },
  { id: 3, cls: "md:col-span-4" },
  { id: 6, cls: "md:col-span-4" },
];

export default function Home() {
  const hero = getForest(1)!;
  return (
    <>
      {/* Hero */}
      <section className="relative isolate flex min-h-[min(calc(100svh-4rem),52rem)] items-center overflow-hidden bg-forest-950 text-white">
        <ForestImage forest={hero} className="absolute inset-0 -z-10" eager zoom alt="" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-950 via-forest-950/55 to-forest-950/20" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest-950/80 via-transparent to-transparent" />
        <div className="wrap pb-20 pt-10 sm:pt-12 lg:pb-24 lg:pt-14">
          <p className="eyebrow animate-fadeUp !text-forest-200">Forest Intelligence Platform</p>
          <h1 className="mt-4 max-w-5xl animate-fadeUp text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl 2xl:text-8xl" style={{ animationDelay: "120ms" }}>
            Understand the Forest.
            <br />
            <span className="text-forest-300">Discover Its Nature.</span>
          </h1>
          <p className="mt-6 max-w-2xl animate-fadeUp text-lg leading-relaxed text-forest-100 sm:text-xl" style={{ animationDelay: "260ms" }}>
            Explore forest ecosystems and identify forest cover types from the terrain and environment of a site.
          </p>
          <div className="mt-10 flex animate-fadeUp flex-wrap gap-4" style={{ animationDelay: "400ms" }}>
            <Link to="/forests" className="btn-light !px-8 !py-4 text-base">
              Explore Forests <ArrowRight size={18} aria-hidden />
            </Link>
            <Link to="/predict" className="btn-ghost-light !px-8 !py-4 text-base">Start a Prediction</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section aria-label="At a glance" className="bg-forest-900 text-white">
        <div className="wrap grid gap-px py-2 md:grid-cols-3 md:divide-x md:divide-white/10">
          {stats.map((s) => (
            <div key={s.label} className="px-4 py-8 md:px-10">
              <p className="font-serif text-4xl font-semibold lg:text-5xl">{s.value}</p>
              <p className="mt-2 max-w-xs text-sm text-forest-200">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-cream py-24">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">How it works</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-semibold sm:text-5xl">From a few measurements to a full forest report</h2>
          </Reveal>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 120}>
                <div className="card h-full p-8 transition-shadow hover:shadow-lift">
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-800 text-forest-100"><Icon size={22} aria-hidden /></span>
                    <span className="font-serif text-5xl font-semibold text-forest-100">0{i + 1}</span>
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold">{title}</h3>
                  <p className="mt-2 leading-relaxed text-forest-800">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Seven forest types */}
      <section className="bg-paper py-24">
        <div className="wrap">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Seven forest cover types</p>
              <h2 className="mt-3 max-w-3xl text-4xl font-semibold sm:text-5xl">Meet the forests of the Rockies</h2>
            </div>
            <Link to="/forests" className="btn-secondary">See all forest types <ArrowRight size={16} aria-hidden /></Link>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {FORESTS.map((f, i) => (
              <Reveal key={f.id} delay={(i % 4) * 90}>
                <Link to={`/forests/${f.id}`} className="group block overflow-hidden rounded-2xl bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                  <div className="overflow-hidden">
                    <ForestImage forest={f} className="aspect-[4/3] transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: f.accent }}>Type {f.id} · {f.zone}</p>
                    <h3 className="mt-1 text-2xl font-semibold">{f.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-forest-800">{f.tagline}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
            <Reveal delay={90}>
              <Link to="/predict" className="flex h-full min-h-[18rem] flex-col justify-between rounded-2xl bg-forest-800 p-8 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-forest-700 hover:shadow-lift">
                <TreePine size={36} aria-hidden className="text-forest-300" />
                <div>
                  <h3 className="text-2xl font-semibold">Which one is it?</h3>
                  <p className="mt-2 text-sm text-forest-100">Describe a site and find out.</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">Start a prediction <ArrowRight size={16} aria-hidden /></span>
                </div>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Featured photography */}
      <section className="bg-forest-950 py-24 text-white">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow !text-forest-300">Featured forest photography</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-semibold sm:text-5xl">From golden aspen to wind-bent treeline</h2>
          </Reveal>
          <div className="mt-12 grid auto-rows-[240px] gap-4 md:auto-rows-[280px] md:grid-cols-12">
            {mosaic.map(({ id, cls }, i) => {
              const f = getForest(id)!;
              return (
                <Reveal key={id} delay={i * 70} className={`${cls} h-full`}>
                  <Link to={`/forests/${id}`} className="group relative block h-full overflow-hidden rounded-2xl">
                    <ForestImage forest={f} className="h-full w-full transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <p className="font-serif text-2xl font-semibold">{f.name}</p>
                      <p className="text-sm text-forest-100">{f.tagline}</p>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why it matters */}
      <section className="bg-cream py-24">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">Why forest classification matters</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-semibold sm:text-5xl">Knowing the forest helps us look after it</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {uses.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 90}>
                <div className="h-full rounded-2xl border border-sage-200 bg-white p-7">
                  <Icon size={26} className="text-forest-600" aria-hidden />
                  <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-forest-800">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative isolate overflow-hidden bg-forest-900 py-28 text-white">
        <ForestImage forest={getForest(5)!} className="absolute inset-0 -z-10 opacity-40" alt="" />
        <div className="absolute inset-0 -z-10 bg-forest-950/60" />
        <Reveal className="wrap text-center">
          <h2 className="mx-auto max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">Ready to identify your forest?</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-forest-100">Describe a site in a few steps and get a full forest identification report.</p>
          <Link to="/predict" className="btn-light mt-10 !px-10 !py-4 text-base">Start a Prediction <ArrowRight size={18} aria-hidden /></Link>
        </Reveal>
      </section>
    </>
  );
}