import { Compass, Globe, Layers, Leaf, Mountain, Sparkles, Thermometer, TreePine } from "lucide-react";
import type { ForestType } from "../lib/forestData";

/** "About this forest" — shared by the results report and the forest detail page. */
export default function ForestInfo({ forest }: { forest: ForestType }) {
  const tiles = [
    { icon: TreePine, label: "Common name", value: forest.name },
    { icon: Leaf, label: "Scientific name", value: forest.scientificName },
    { icon: Globe, label: "Geographical distribution", value: forest.distribution },
    { icon: Thermometer, label: "Climate", value: forest.climate },
    { icon: Mountain, label: "Typical elevation", value: forest.elevation },
    { icon: Layers, label: "Soil and terrain", value: forest.soilTerrain },
  ];
  return (
    <div className="space-y-8">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {tiles.map(({ icon: Icon, label, value }) => (
          <div key={label} className="card p-6 transition-shadow hover:shadow-lift">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest-50 text-forest-700">
              <Icon size={20} aria-hidden />
            </span>
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-sage-500">{label}</p>
            <p className="mt-1 leading-relaxed text-forest-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="rounded-2xl bg-forest-900 p-8 text-white lg:col-span-3">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-forest-200">
            <Compass size={14} aria-hidden /> Ecological importance
          </p>
          <p className="mt-4 text-lg leading-relaxed text-forest-50">{forest.ecologicalImportance}</p>
        </div>
        <div className="card p-8 lg:col-span-2">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-sage-500">
            <Sparkles size={14} aria-hidden /> Interesting facts
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed">
            {forest.facts.map((f) => (
              <li key={f} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: forest.accent }} aria-hidden />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}