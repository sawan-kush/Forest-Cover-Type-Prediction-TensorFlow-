import { AlertCircle } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import type { FeatureInfo } from "../types";

export default function NumberField({ feature: f }: { feature: FeatureInfo }) {
  const { register, control, formState: { errors } } = useFormContext();
  const value = useWatch({ control, name: f.name }) as number | undefined;
  const error = errors[f.name]?.message as string | undefined;
  const id = `field-${f.name}`;

  const outsideTypical =
    typeof value === "number" && Number.isFinite(value) && f.typical_min !== undefined && f.typical_max !== undefined &&
    (value < f.typical_min || value > f.typical_max);

  const hasRange = f.hard_min !== undefined && f.hard_max !== undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-1 flex items-baseline justify-between gap-2 text-sm font-medium">
        <span>{f.label}</span>
        {f.unit ? <span className="text-xs font-normal text-sage-500">{f.unit}</span> : null}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        step="any"
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-hint`}
        className={`input ${error ? "input-error" : ""}`}
        {...register(f.name, {
          valueAsNumber: true,
          required: "Enter a value.",
          validate: (v) => Number.isFinite(v) || "Enter a number.",
          ...(hasRange && {
            min: { value: f.hard_min as number, message: `Must be at least ${f.hard_min}.` },
            max: { value: f.hard_max as number, message: `Must be at most ${f.hard_max}.` },
          }),
        })}
      />
      <p id={`${id}-hint`} className="mt-1 text-xs leading-snug text-sage-500">
        {f.description}
        {f.typical_min !== undefined && f.typical_max !== undefined && (
          <> Typical range in the data: {f.typical_min} to {f.typical_max}.</>
        )}
      </p>
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-600" role="alert">
          <AlertCircle size={12} aria-hidden /> {error}
        </p>
      )}
      {!error && outsideTypical && (
        <p className="mt-1 text-xs text-amber-700">Outside the range seen in training data. The prediction may be unreliable.</p>
      )}
    </div>
  );
}
