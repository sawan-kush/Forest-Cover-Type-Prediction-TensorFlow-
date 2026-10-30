/** ForestSphere mark: a pine inside a sphere. */
export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <defs>
        <linearGradient id="fs-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3f9566" />
          <stop offset="1" stopColor="#10331f" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="19" fill="url(#fs-g)" />
      <ellipse cx="20" cy="20" rx="19" ry="7.5" fill="none" stroke="#bdd3bf" strokeOpacity="0.35" />
      <path d="M20 7l6 8h-3.5l5 7H23v7h-6v-7h-5.5l5-7H14z" fill="#eef4ee" />
    </svg>
  );
}