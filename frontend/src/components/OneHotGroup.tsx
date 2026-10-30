import { useFormContext } from "react-hook-form";
import type { FeatureGroup, FeatureInfo } from "../types";

interface Props {
  group: FeatureGroup;
  features: FeatureInfo[];
}

/** One-of-N selector. Wilderness area (4 options) uses radio cards; soil (40 options) a dropdown grouped by soil family. */
export default function OneHotGroup({ group, features }: Props) {
  const { register } = useFormContext();
  const name = `oh_${group.id}`;

  if (features.length <= 6) {
    return (
      <fieldset>
        <legend className="sr-only">{group.title}</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {features.map((f) => (
            <label key={f.name} className="flex cursor-pointer items-start gap-3 rounded-xl border border-sage-300 bg-white p-4 text-sm transition-colors hover:border-forest-500 has-[:checked]:border-forest-700 has-[:checked]:bg-forest-50 has-[:checked]:ring-1 has-[:checked]:ring-forest-700">
              <input type="radio" value={f.name} className="mt-1 accent-forest-700" {...register(name)} />
              <span>
                <span className="block font-semibold">{f.label}</span>
                <span className="block text-xs text-sage-500">{f.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  // Group the options under their category heading (first-appearance order), if categories are provided.
  const categories = new Map<string, FeatureInfo[]>();
  for (const f of features) {
    const key = f.category ?? "";
    categories.set(key, [...(categories.get(key) ?? []), f]);
  }
  const grouped = !(categories.size === 1 && categories.has(""));

  return (
    <div className="max-w-3xl">
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold">{group.title}</label>
      <select id={name} className="input" {...register(name)}>
        {grouped
          ? [...categories.entries()].map(([category, items]) => (
              <optgroup key={category} label={category}>
                {items.map((f) => (
                  <option key={f.name} value={f.name}>{f.label}</option>
                ))}
              </optgroup>
            ))
          : features.map((f) => (
              <option key={f.name} value={f.name}>{f.label}</option>
            ))}
      </select>
      <p className="mt-1.5 text-xs text-sage-500">
        Choose the soil that best matches your site. Names follow the US Forest Service soil survey used to train the model.
      </p>
    </div>
  );
}