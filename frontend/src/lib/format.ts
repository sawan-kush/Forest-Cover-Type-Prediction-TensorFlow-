export function pct(p: number, digits = 2): string {
  const v = p * 100;
  if (v === 0) return "0%";
  if (v < 0.01) return "<0.01%";
  return `${v.toFixed(digits)}%`;
}

export const COVER_NAMES: Record<number, string> = {
  1: "Spruce/Fir",
  2: "Lodgepole Pine",
  3: "Ponderosa Pine",
  4: "Cottonwood/Willow",
  5: "Aspen",
  6: "Douglas-fir",
  7: "Krummholz",
};
