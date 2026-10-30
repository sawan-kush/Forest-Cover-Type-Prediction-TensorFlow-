import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ForestImage from "../components/ForestImage";
import Reveal from "../components/Reveal";
import { getForest } from "../lib/forestData";

/** Rough low-to-high order in which these forests are met on a Rocky Mountain slope. */
const ladder = [
  { id: 7, note: "Stunted, wind-bent trees at the upper limit of the forest." },
  { id: 1, note: "Cold, snowy forests of spruce and fir below the treeline." },
  { id: 5, note: "Aspen groves from the montane zone up into the subalpine." },
  { id: 2, note: "Lodgepole pine across the montane and subalpine zones." },
  { id: 6, note: "Douglas-fir on cooler, shadier montane slopes." },
  { id: 3, note: "Open ponderosa woodlands on sunny, dry foothills." },
  { id: 4, note: "Cottonwoods and willows along streams in the valleys." },
];

const ideas = [
  { title: "Forests change with height", text: "As you climb a mountain it gets colder and wetter, and the dominant trees change in a fairly predictable sequence." },
  { title: "Aspect matters", text: "North-facing slopes are cooler and moister than south-facing ones, so they often host different forests at the same elevation." },
  { title: "Water shapes the valley", text: "Streams and rivers create their own forests of cottonwoods and willows, even where the surrounding hills are dry." },
  { title: "Fire is part of the story", text: "Many Rocky Mountain forests are shaped by fire. Some trees rely on it to open their cones or to clear space for seedlings." },
];

export default function AboutForests() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-forest-950 text-white">
        <ForestImage forest={getForest(5)!} className="absolute inset-0 -z-10" eager alt="" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest-950 via-forest-950/80 to-forest-950/30" />
        <div className="wrap py-20 lg:py-32">
          <p className="eyebrow !text-forest-300">About forests</p>
          <h1 className="mt-3 max-w-4xl text-5xl font-semibold leading-tight sm:text-6xl">How a mountain sorts its forests</h1>
          <p className="mt-5 max-w-2xl text-lg text-forest-100">
            ForestSphere describes seven forest cover types of the Colorado Rocky Mountains. Here is how they fit together on the landscape.
          </p>
        </div>
      </section>

      <section className="bg-paper py-24">
        <div className="wrap grid gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Life zones</p>
            <h2 className="mt-3 text-4xl font-semibold">From the treeline to the valley floor</h2>
            <p className="mt-4 leading-relaxed text-forest-800">
              This is a simplified guide, listed from highest to lowest. Real forests overlap and mix, and local conditions such as
              slope direction, soil and fire history can shift where each type grows.
            </p>
            <ol className="mt-8 space-y-3">
              {ladder.map(({ id, note }) => {
                const f = getForest(id)!;
                return (
                  <li key={id}>
                    <Link to={`/forests/${id}`} className="group flex items-center gap-4 rounded-2xl border border-sage-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-lift">
                      <span className="h-12 w-1.5 shrink-0 rounded-full" style={{ background: f.accent }} aria-hidden />
                      <span className="flex-1">
                        <span className="block font-semibold">{f.name} <span className="text-xs font-normal text-sage-500">· {f.zone}</span></span>
                        <span className="block text-sm text-forest-800">{note}</span>
                      </span>
                      <ArrowRight size={16} className="text-sage-400 transition-transform group-hover:translate-x-1" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ol>
          </Reveal>

          <Reveal delay={120} className="space-y-5">
            {ideas.map((i) => (
              <div key={i.title} className="card p-7">
                <h3 className="text-xl font-semibold">{i.title}</h3>
                <p className="mt-2 leading-relaxed text-forest-800">{i.text}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="bg-cream py-24">
        <div className="wrap grid gap-10 lg:grid-cols-2">
          <Reveal className="rounded-3xl bg-forest-900 p-10 text-white">
            <h2 className="text-3xl font-semibold">Reading your result</h2>
            <p className="mt-4 leading-relaxed text-forest-100">
              Your report shows the forest type that best matches the site you described, together with a confidence percentage.
              Confidence is a predicted probability, not a guarantee, and nearby forest types can look alike when conditions overlap.
            </p>
            <p className="mt-4 leading-relaxed text-forest-100">
              ForestSphere works only from the measurements you enter. It does not pinpoint or verify a real place on the map, so
              treat a result as an informed suggestion and check it against what you see on the ground.
            </p>
            <Link to="/predict" className="btn-light mt-8">Start a Prediction <ArrowRight size={16} aria-hidden /></Link>
          </Reveal>
          <Reveal delay={120} className="flex flex-col justify-center">
            <p className="eyebrow">Photography</p>
            <h2 className="mt-3 text-3xl font-semibold">Pictures from the commons</h2>
            <p className="mt-4 leading-relaxed text-forest-800">
              Forest photographs come from Wikipedia and Wikimedia Commons, where photographers share their work under free licences.
              Each picture illustrates the species or landscape typical of its forest type, not a specific location you entered.
            </p>
            <Link to="/forests" className="btn-secondary mt-8 self-start">Browse forest types <ArrowRight size={16} aria-hidden /></Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}