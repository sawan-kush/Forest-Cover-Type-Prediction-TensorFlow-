import { useFormContext } from "react-hook-form";
import type { FeatureGroup, FeatureInfo } from "../types";

interface Props {
  group: FeatureGroup;
  features: FeatureInfo[];
}

/** One-of-N selector. Wilderness area (4 options) uses radio cards, soil type (40) a dropdown. */
export default function OneHotGroup({ group, features }: Props) {
  const { register } = useFormContext();
  const name = `oh_${group.id}`;

  if (features.length <= 6) {
    return (
      <fieldset>
        <legend className="sr-only">{group.title}</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {features.map((f) => (
            <label key={f.name} className="flex cursor-pointer items-start gap-3 rounded-lg border border-sage-300 bg-white p-3 text-sm has-[:checked]:border-forest-700 has-[:checked]:bg-forest-50">
              <input type="radio" value={f.name} className="mt-1 accent-forest-700" {...register(name)} />
              <span>
                <span className="block font-medium">{f.label}</span>
                <span className="block text-xs text-sage-500">{f.description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <div className="max-w-sm">
      <label htmlFor={name} className="mb-1 block text-sm font-medium">{group.title}</label>
      <select id={name} className="input" {...register(name)}>
        {features.map((f) => (
          <option key={f.name} value={f.name}>{f.label}</option>
        ))}
      </select>
      <p className="mt-1 text-xs text-sage-500">
        Exactly one soil type applies to a site. The other {features.length - 1} indicators are sent as 0.
      </p>
    </div>
  );
}
