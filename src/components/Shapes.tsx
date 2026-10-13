// The site's small geometric marks. Each macro has a shape as well as a colour
// (protein ■, carbs ●, fat ▲), so they read the same without colour.
import type { Period } from '../lib/types';

export type MacroKey = 'protein' | 'carbs' | 'fat';

export const MACROS: { key: MacroKey; label: string; short: string; bar: string }[] = [
  { key: 'protein', label: 'Protein', short: 'P', bar: 'bg-protein' },
  { key: 'carbs', label: 'Carbs', short: 'C', bar: 'bg-carbs' },
  { key: 'fat', label: 'Fat', short: 'F', bar: 'bg-fat' },
];

export function MacroShape({ macro, className = 'size-2.5' }: { macro: MacroKey; className?: string }) {
  return (
    <svg viewBox="0 0 10 10" className={`shrink-0 ${className}`} aria-hidden="true">
      {macro === 'protein' && <rect width="10" height="10" className="fill-protein" />}
      {macro === 'carbs' && <circle cx="5" cy="5" r="5" className="fill-carbs" />}
      {macro === 'fat' && <path d="M5 0.5 10 9.5H0z" className="fill-fat" />}
    </svg>
  );
}

/** The site's mark: a scarlet square holding a white plate. */
export function Logo({ className = 'size-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" className="fill-scarlet" />
      <circle cx="16" cy="16" r="9" fill="#fff" />
      <path d="M16 7a9 9 0 0 1 0 18z" className="fill-scarlet" opacity="0.18" />
    </svg>
  );
}

export function Arrow({ className = 'size-5', back = false }: { className?: string; back?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className={`shrink-0 ${back ? 'rotate-180' : ''} ${className}`} fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="M3 10h13M11 5l5 5-5 5" />
    </svg>
  );
}

/** One of four abstract marks, so each dining hall card has its own. */
export function HallGlyph({ index, className = 'size-10' }: { index: number; className?: string }) {
  const shapes = [
    // Three towers.
    <g key="0">
      <rect x="4" y="14" width="8" height="22" />
      <rect x="16" y="4" width="8" height="32" />
      <rect x="28" y="10" width="8" height="26" />
    </g>,
    // A plate.
    <g key="1">
      <circle cx="20" cy="20" r="16" />
      <circle cx="20" cy="20" r="8" className="fill-bg" />
    </g>,
    // Sunset.
    <g key="2">
      <path d="M4 28a16 16 0 0 1 32 0z" />
      <rect x="4" y="32" width="32" height="4" />
    </g>,
    // Pennant.
    <g key="3">
      <path d="M6 4 36 20 6 36z" />
    </g>,
  ];
  return (
    <svg viewBox="0 0 40 40" className={`fill-current ${className}`} aria-hidden="true">
      {shapes[index % shapes.length]}
    </svg>
  );
}

/** A sun at a different height for each meal of the day. */
export function PeriodGlyph({ period, className = 'size-5' }: { period: Period; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={`shrink-0 ${className}`} aria-hidden="true">
      <line x1="1" y1="15.5" x2="19" y2="15.5" className="stroke-line-strong" strokeWidth="1" />
      {period === 'breakfast' && <path d="M4 15a6 6 0 0 1 12 0z" className="fill-scarlet" />}
      {period === 'brunch' && <circle cx="10" cy="10" r="5" className="fill-scarlet" />}
      {period === 'lunch' && <circle cx="10" cy="6.5" r="5" className="fill-scarlet" />}
      {period === 'dinner' && <path d="M4 15a6 6 0 0 1 12 0z" className="fill-none stroke-scarlet" strokeWidth="1.5" />}
    </svg>
  );
}
