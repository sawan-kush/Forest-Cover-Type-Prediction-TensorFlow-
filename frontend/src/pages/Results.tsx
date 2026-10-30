import { AlertTriangle, Info, RotateCcw } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { COVER_NAMES, pct } from "../lib/format";
import { useResult } from "../lib/ResultContext";

export default function Results() {
  const { result } = useResult();
  if (!result) return <Navigate to="/predict" replace />;

  const data = Object.entries(result.probabilities).map(([key, p]) => {
    const id = Number(key.replace("Cover Type ", ""));
    return {
      id,
      label: `${id}. ${COVER_NAMES[id] ?? key}`,
      value: Number((p * 100).toFixed(4)),
      predicted: id === result.predicted_cover_type,
    };
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="card overflow-hidden">
        <div className="bg-forest-900 px-6 py-8 text-white sm:px-8">
          <p className="text-sm text-forest-200">Predicted forest cover type</p>
          <h1 className="mt-1 text-3xl font-semibold sm:text-4xl">
            Type {result.predicted_cover_type}: {result.predicted_cover_type_name}
          </h1>
          <p className="mt-4 text-lg">
            Model confidence <span className="font-serif text-2xl font-semibold">{pct(result.confidence)}</span>
          </p>
        </div>
        <div className="flex gap-3 bg-bark-100 px-6 py-4 text-sm leading-relaxed text-bark-700 sm:px-8">
          <Info size={18} className="mt-0.5 shrink-0" aria-hidden />
          <p>
            Confidence is the neural network's predicted probability for this class. It is not a guarantee that the
            prediction is correct.
          </p>
        </div>
      </section>

      {result.warnings.length > 0 && (
        <section className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900" role="alert">
          <p className="flex items-center gap-2 font-semibold">
            <AlertTriangle size={16} aria-hidden /> Check these inputs
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {result.warnings.map((w) => <li key={w}>{w}</li>)}
          </ul>
        </section>
      )}

      <section className="card p-6">
        <h2 className="text-xl font-semibold">Probability by cover type</h2>
        <div className="mt-4 h-80 w-full" role="img" aria-label="Horizontal bar chart of predicted probability for each of the seven cover types">
          <ResponsiveContainer>
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 56, bottom: 4, left: 8 }}>
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: "#7a8d6e" }} />
              <YAxis type="category" dataKey="label" width={140} tick={{ fontSize: 13, fill: "#10331f" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => [`${v}%`, "Probability"]} cursor={{ fill: "#eef4ee" }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
                {data.map((d) => <Cell key={d.id} fill={d.predicted ? "#1f5e3d" : "#b7c4ad"} />)}
                <LabelList dataKey="value" position="right" formatter={(v: number) => pct(v / 100)} style={{ fontSize: 12, fill: "#10331f" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <table className="mt-4 w-full text-sm">
          <caption className="sr-only">Probabilities for all seven cover types</caption>
          <thead>
            <tr className="border-b border-sage-200 text-left text-sage-500">
              <th className="py-2 font-medium">Cover type</th>
              <th className="py-2 text-right font-medium">Probability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sage-100">
            {data.map((d) => (
              <tr key={d.id} className={d.predicted ? "bg-forest-50 font-semibold" : ""}>
                <td className="px-2 py-2">{d.label}</td>
                <td className="px-2 py-2 text-right">{pct(d.value / 100)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="flex justify-end">
        <Link to="/predict" className="btn-primary">
          <RotateCcw size={16} aria-hidden /> Make another prediction
        </Link>
      </div>
    </div>
  );
}
