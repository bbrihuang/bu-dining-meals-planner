// Small building blocks shared by several screens.
import type { CSSProperties, ReactNode } from 'react';
import type { ServingState } from '../lib/data';

type Rgb = [number, number, number];
const WHITE: Rgb = [255, 255, 255];
const INK: Rgb = [22, 24, 29]; // --ink in light mode
const DARK_BG: Rgb = [15, 17, 20]; // --bg in dark mode

const hexToRgb = (hex: string): Rgb => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as Rgb;
};
const rgbToHex = (rgb: Rgb) => '#' + rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('');
const luminance = (rgb: Rgb) => {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
/** WCAG contrast ratio between two colours. */
export const contrast = (a: Rgb, b: Rgb) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
/** Text on a school-coloured fill: white when it reads (4.5:1), otherwise ink. */
const textOn = (fill: Rgb) => (contrast(WHITE, fill) >= 4.5 || contrast(WHITE, fill) > contrast(INK, fill) ? WHITE : INK);

/**
 * Spread on an element to give everything inside it the school's colour (see
 * [data-school] in index.css). Works for any school colour: in dark mode the
 * colour is lightened only as far as it takes to stand out from the page
 * (3:1), and the text on it is picked by contrast in both modes.
 */
export function schoolScope(color: string) {
  const light = hexToRgb(color);
  let dark = light;
  for (let t = 0.05; contrast(dark, DARK_BG) < 3 && t <= 1; t += 0.05) {
    dark = light.map((c, i) => c + (WHITE[i] - c) * t) as Rgb;
  }
  return {
    'data-school': '',
    style: {
      '--school-light': color,
      '--on-school-light': rgbToHex(textOn(light)),
      '--school-dark': rgbToHex(dark),
      '--on-school-dark': rgbToHex(textOn(dark)),
    } as CSSProperties,
  };
}

/** A row of mutually exclusive choices, drawn as pills. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className="pill"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** `alert` interrupts a screen reader (something failed); `status` waits for a pause. */
export function Notice({ children, action, tone = 'status' }: { children: ReactNode; action?: ReactNode; tone?: 'status' | 'alert' }) {
  return (
    <div
      role={tone}
      className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm ${tone === 'alert' ? 'bg-danger-soft' : 'bg-warn-soft'}`}
    >
      <p>{children}</p>
      {action}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-card/70 ${className}`} aria-hidden="true" />;
}

const DIET_TAGS: [string, string][] = [
  ['vegan', 'Vegan'],
  ['vegetarian', 'Vegetarian'],
  ['halal', 'Halal'],
  ['gluten-free', 'Gluten free'],
];

/** Diet labels in full words, so they read on a phone with no tooltip. */
export function DietTags({ tags, className = '' }: { tags: string[]; className?: string }) {
  const shown = DIET_TAGS.filter(([t]) => tags.includes(t) && !(t === 'vegetarian' && tags.includes('vegan')));
  if (!shown.length) return null;
  return (
    <span className={`inline-flex flex-wrap gap-1 ${className}`}>
      {shown.map(([t, label]) => (
        <span key={t} className="rounded-full bg-good-soft px-2 py-0.5 text-[0.6875rem] font-semibold leading-4 text-good">
          {label}
        </span>
      ))}
    </span>
  );
}

const STATE: Record<ServingState, { label: string; className: string }> = {
  open: { label: 'Open now', className: 'bg-good-soft text-good' },
  later: { label: 'Later today', className: 'bg-surface text-muted' },
  closed: { label: 'Closed', className: 'bg-surface text-muted' },
};

/** "Open now", "Later today" or "Closed", for a meal or a hall today. */
export function StateChip({ state }: { state: ServingState | null }) {
  if (!state) return null;
  const s = STATE[state];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.className}`}>
      {state === 'open' && <span className="size-1.5 rounded-full bg-good" aria-hidden="true" />}
      {s.label}
    </span>
  );
}
