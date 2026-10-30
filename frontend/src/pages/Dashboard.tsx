import { ArrowRight, BarChart3, Brain, Layers, ListChecks } from "lucide-react";
import { Link } from "react-router-dom";
import ContourBackdrop from "../components/ContourBackdrop";
import { COVER_NAMES } from "../lib/format";

const stats = [
  { icon: Brain, label: "Model type", value: "Artificial Neural Network" },
  { icon: BarChart3, label: "Test accuracy", value: "about 92.87%" },
  { icon: Layers, label: "Input features", value: "54" },
  { icon: ListChecks, label: "Output classes", value: "7" },
];

export default function Dashboard() {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl bg-forest-900 px-6 py-12 text-white sm:px-12 sm:py-16">
        <div className="pointer-events-none absolute inset-0 text-forest-600 opacity-60">
          <ContourBackdrop />
        </div>
        <div className="relative max-w-2xl">
          <h1 className="text-3xl font-semibold leading-tight sm:text-5xl">
            Identify the forest cover of a site from its terrain
          </h1>
          <p className="mt-4 text-base leading-relaxed text-forest-100 sm:text-lg">
            Enter elevation, slope, water and road distances, sunlight, wilderness area and soil type. A trained neural
            network returns the most likely of seven cover types, with the probability it assigns to each.
          </p>
          <Link to="/predict" className="btn mt-8 bg-white text-forest-900 hover:bg-forest-100">
            Start a prediction <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </section>

      <section aria-label="Model summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="card flex items-start gap-3 p-5">
            <span className="rounded-lg bg-forest-50 p-2 text-forest-700">
              <Icon size={20} aria-hidden />
            </span>
            <div>
              <p className="text-sm text-sage-500">{label}</p>
              <p className="font-serif text-lg font-semibold leading-snug">{value}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <div className="card p-6 lg:col-span-3">
          <h2 className="text-xl font-semibold">How the prediction works</h2>
          <ol className="mt-4 space-y-3 text-sm leading-relaxed text-forest-800">
            <li><strong>You enter the site details.</strong> Values are the original, unscaled measurements.</li>
            <li><strong>The server prepares them.</strong> The 10 continuous measurements are standardised with the scaler saved from training. Wilderness and soil indicators stay as 0 or 1.</li>
            <li><strong>The neural network scores seven classes.</strong> The highest probability becomes the predicted cover type.</li>
          </ol>
          <p className="mt-5 rounded-lg bg-bark-100 p-4 text-sm leading-relaxed text-bark-700">
            The accuracy figure describes the model across a held-out test set. It does not guarantee that any single
            prediction is correct, and results are less reliable for values outside the range of the training data.
          </p>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold">Cover types</h2>
          <ul className="mt-4 divide-y divide-sage-100">
            {Object.entries(COVER_NAMES).map(([id, name]) => (
              <li key={id} className="flex items-center gap-3 py-2 text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-100 text-xs font-semibold text-forest-800">{id}</span>
                {name}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
