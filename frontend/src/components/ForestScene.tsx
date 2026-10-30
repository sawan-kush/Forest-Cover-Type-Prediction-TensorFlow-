import type { ForestType } from "../lib/forestData";

/** Illustrated fallback shown only if no photograph can be loaded. */
export default function ForestScene({ forest }: { forest: ForestType }) {
  const c = forest.accent;
  const trees = Array.from({ length: 11 }, (_, i) => i);
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`sky-${forest.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dfe9dc" />
          <stop offset="1" stopColor="#f6f3ea" />
        </linearGradient>
      </defs>
      <rect width="800" height="500" fill={`url(#sky-${forest.id})`} />
      <path d="M0 330 L150 220 L260 300 L420 170 L560 290 L680 210 L800 300 V500 H0Z" fill={c} opacity="0.35" />
      <rect y="380" width="800" height="120" fill="#10331f" opacity="0.92" />
      {trees.map((i) => {
        const x = 30 + i * 72 + (i % 2) * 14;
        const h = 90 + ((i * 37) % 70);
        const base = 400 + ((i * 13) % 40);
        if (forest.scene === "deciduous")
          return (
            <g key={i}>
              <rect x={x - 3} y={base - h / 2} width="6" height={h / 2} fill="#e8e2d0" />
              <circle cx={x} cy={base - h / 2 - 22} r={30 + (i % 3) * 6} fill={c} />
            </g>
          );
        if (forest.scene === "riparian")
          return (
            <g key={i}>
              <rect x={x - 4} y={base - h / 1.6} width="8" height={h / 1.6} fill="#6e5334" />
              <ellipse cx={x} cy={base - h / 1.6 - 18} rx={38} ry={30} fill={c} />
            </g>
          );
        if (forest.scene === "stunted")
          return <path key={i} d={`M${x - 34} ${base} Q${x - 10} ${base - 46 - (i % 3) * 10} ${x + 38} ${base - 12} Z`} fill={c} />;
        return <path key={i} d={`M${x} ${base - h} L${x + 30} ${base} H${x - 30}Z`} fill={c} />;
      })}
    </svg>
  );
}