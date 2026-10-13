// The home page's abstract composition: a scarlet sun (or plate) on a horizon, an
// arched block, a dot grid and slowly turning arcs, all drawn on a hairline grid.
// Colours come from the theme, so in dark mode the ink block turns white.
export default function HeroArt({ className = '' }: { className?: string }) {
  const grid = [80, 160, 240, 320, 400];
  const dots = [0, 1, 2, 3].flatMap((r) => [0, 1, 2, 3].map((c) => [44 + c * 24, 44 + r * 24]));
  return (
    <svg viewBox="0 0 480 480" className={className} role="img" aria-label="Abstract shapes in scarlet and white">
      <defs>
        <clipPath id="hero-frame">
          <rect width="480" height="480" />
        </clipPath>
      </defs>
      <g clipPath="url(#hero-frame)">
        {grid.map((v) => (
          <g key={v} className="stroke-line" strokeWidth="1">
            <line x1={v} y1="0" x2={v} y2="480" />
            <line x1="0" y1={v} x2="480" y2={v} />
          </g>
        ))}

        <g className="fill-muted" opacity="0.55">
          {dots.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="2.5" />
          ))}
        </g>

        <circle cx="320" cy="160" r="120" className="fill-scarlet" />
        <line x1="0" y1="280" x2="480" y2="280" className="stroke-ink" strokeWidth="2" />

        <rect x="80" y="280" width="160" height="160" className="fill-ink" />
        <path d="M112 440V376a48 48 0 0 1 96 0v64z" className="fill-bg" />

        <rect x="280" y="360" width="40" height="40" className="fill-scarlet" />

        <g className="origin-[480px_480px] animate-spin-slow fill-none stroke-scarlet" strokeWidth="2">
          {[56, 96, 136].map((r) => (
            <circle key={r} cx="480" cy="480" r={r} strokeDasharray={`${r * 0.9} ${r * 0.35}`} />
          ))}
        </g>

        <path d="M400 40h40v40z" className="fill-ink" />
      </g>
      <rect x="0.5" y="0.5" width="479" height="479" className="fill-none stroke-line-strong" />
    </svg>
  );
}
