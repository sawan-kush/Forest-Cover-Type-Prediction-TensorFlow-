import { useEffect, useState } from "react";
import { classIdFromKey, pct } from "../lib/format";
import { getForest } from "../lib/forestData";

interface Props {
  probabilities: Record<string, number>;
  predicted: number;
}

/** Horizontal bars for all seven forest types, predicted one highlighted. */
export default function ProbabilityBars({ probabilities, predicted }: Props) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOn(true), 120);
    return () => clearTimeout(t);
  }, []);

  const rows = Object.entries(probabilities)
    .map(([key, p]) => ({ id: classIdFromKey(key), p }))
    .filter((r) => Number.isFinite(r.id))
    .sort((a, b) => b.p - a.p);

  return (
    <ul className="space-y-4" aria-label="Probability for each of the seven forest types">
      {rows.map(({ id, p }) => {
        const forest = getForest(id);
        const top = id === predicted;
        return (
          <li key={id} className={`rounded-xl p-3 transition-colors ${top ? "bg-forest-50 ring-1 ring-forest-300" : ""}`}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <span className={`flex items-center gap-2 text-sm ${top ? "font-semibold" : "font-medium"}`}>
                <span className="inline-block h-3 w-3 rounded-full" style={{ background: forest?.accent ?? "#7a8d6e" }} aria-hidden />
                Type {id}: {forest?.name ?? `Cover Type ${id}`}
                {top && <span className="rounded-full bg-forest-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">Predicted</span>}
              </span>
              <span className={`tabular-nums ${top ? "text-lg font-semibold" : "text-sm text-forest-800"}`}>{pct(p)}</span>
            </div>
            <div className="h-3.5 w-full overflow-hidden rounded-full bg-sage-100">
              <div
                className="h-full rounded-full transition-[width] duration-1000 ease-out"
                style={{
                  width: on ? `${Math.max(p * 100, p > 0 ? 0.6 : 0)}%` : "0%",
                  background: top ? "linear-gradient(90deg,#1f5e3d,#3f9566)" : forest?.accent ?? "#b7c4ad",
                  opacity: top ? 1 : 0.55,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}