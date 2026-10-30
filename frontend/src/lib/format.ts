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

/** "Cover Type 3" -> 3 */
export function classIdFromKey(key: string): number {
  const m = key.match(/\d+/);
  return m ? Number(m[0]) : NaN;
}

export function compass(deg: number): string {
  const names = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];
  return names[Math.round((((deg % 360) + 360) % 360) / 45) % 8];
}

export function fmtNumber(n: number): string {
  return Number.isInteger(n) ? n.toLocaleString("en-US") : n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}