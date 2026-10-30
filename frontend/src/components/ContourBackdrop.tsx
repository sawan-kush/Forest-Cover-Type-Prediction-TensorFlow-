/** Decorative topographic contour lines, echoing the elevation data the model uses. */
export default function ContourBackdrop() {
  const rings = [30, 58, 86, 114, 142, 170, 198];
  return (
    <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" aria-hidden preserveAspectRatio="xMidYMid slice">
      <g fill="none" stroke="currentColor" strokeWidth="1">
        {rings.map((r, i) => (
          <path
            key={r}
            d={`M ${200 - r * 1.5} ${150 + i * 2} C ${200 - r} ${150 - r * 0.9}, ${200 + r * 0.6} ${150 - r}, ${200 + r * 1.5} ${150 - i * 3} S ${200 + r} ${150 + r * 0.9}, ${200 - r * 0.3} ${150 + r * 0.95} S ${200 - r * 1.5} ${150 + r * 0.4}, ${200 - r * 1.5} ${150 + i * 2} Z`}
            opacity={0.35 + (rings.length - i) * 0.07}
          />
        ))}
      </g>
    </svg>
  );
}
