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
  const padRight = f.unit ? `${Math.max(3, f.unit.length * 0.62 + 1.4)}rem` : undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">{f.label}</label>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step="any"
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-hint`}
          style={{ paddingRight: padRight }}
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
        {f.unit ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-sage-500">{f.unit}</span>
        ) : null}
      </div>
      <p id={`${id}-hint`} className="mt-1.5 text-xs leading-snug text-sage-500">
        {f.description}
        {f.typical_min !== undefined && f.typical_max !== undefined && (
          <> Typical range: {f.typical_min} to {f.typical_max}{f.unit && !f.unit.startsWith("index") ? ` ${f.unit}` : ""}.</>
        )}
      </p>
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-600" role="alert">
          <AlertCircle size={12} aria-hidden /> {error}
        </p>
      )}
      {!error && outsideTypical && (
        <p className="mt-1 text-xs text-amber-700">This value is outside the typical range for these forests, so the result may be less reliable.</p>
      )}
    </div>
  );
}