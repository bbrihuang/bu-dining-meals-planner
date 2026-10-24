// The site's small marks. Protein, carbs and fat each have a colour, but a dot
// only ever appears next to the macro's name, inside the optional breakdown.
export type MacroKey = 'protein' | 'carbs' | 'fat';

export const MACROS: { key: MacroKey; label: string; short: string; bar: string; dot: string }[] = [
  { key: 'protein', label: 'Protein', short: 'P', bar: 'bg-protein', dot: 'bg-protein' },
  { key: 'carbs', label: 'Carbs', short: 'C', bar: 'bg-carbs', dot: 'bg-carbs' },
  { key: 'fat', label: 'Fat', short: 'F', bar: 'bg-fat', dot: 'bg-fat' },
];

export function MacroDot({ macro, className = 'size-2' }: { macro: MacroKey; className?: string }) {
  const m = MACROS.find((x) => x.key === macro)!;
  return <span className={`inline-block shrink-0 rounded-full ${m.dot} ${className}`} aria-hidden="true" />;
}

/** The site's mark: a plate on a dark card. Neutral, so it suits any school. */
export function Logo({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-ink" />
      <circle cx="16" cy="16" r="9" className="fill-card" />
      <circle cx="16" cy="16" r="5" className="fill-none stroke-line-strong" strokeWidth="1.25" />
    </svg>
  );
}

export function Arrow({ className = 'size-5', back = false }: { className?: string; back?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className={`shrink-0 ${back ? 'rotate-180' : ''} ${className}`} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 10h13M11.5 5l5 5-5 5" />
    </svg>
  );
}
