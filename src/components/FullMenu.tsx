// Everything the hall serves at one meal, grouped by station, with each dish's
// calories and macros. Tap a dish for its details, or a "Create Your Own" station
// for its options.
import { useState } from 'react';
import { isSuspect } from '../lib/classify';
import { minutesNow, parseHours } from '../lib/data';
import { fmt } from '../lib/targets';
import { PERIOD_LABEL, PERIODS, type HallDay, type MenuItem, type Period } from '../lib/types';
import { MacroShape, MACROS } from './Shapes';
import { Segmented } from './ui';

/** The meal being served now, or the next one today; else the first. */
function defaultPeriod(day: HallDay, periods: Period[], timeZone: string | null): Period {
  if (!timeZone) return periods[0];
  const now = minutesNow(timeZone);
  return periods.find((p) => (parseHours(day[p]?.hours)?.[1] ?? 0) > now) ?? periods[0];
}

const TAGS: [string, string, string][] = [
  ['vegan', 'VG', 'Vegan'],
  ['vegetarian', 'V', 'Vegetarian'],
  ['halal', 'H', 'Halal'],
  ['gluten-free', 'GF', 'Gluten free'],
];

export default function FullMenu({ day, timeZone }: { day: HallDay; /** Set when the day is today. */ timeZone: string | null }) {
  const periods = PERIODS.filter((p) => day[p]?.items.length);
  const [period, setPeriod] = useState<Period>(() => defaultPeriod(day, periods, timeZone));
  const [query, setQuery] = useState('');
  const meal = day[period];
  const q = query.trim().toLowerCase();

  const hit = (i: MenuItem) => i.name.toLowerCase().includes(q) || i.station.toLowerCase().includes(q);
  const items = (meal?.items ?? [])
    .map((i) => (!q || hit(i) ? i : i.options?.some(hit) ? { ...i, options: i.options.filter(hit) } : null))
    .filter((i): i is MenuItem => i != null);
  const stations = [...new Set(items.map((i) => i.station))].map((s) => ({ name: s, items: items.filter((i) => i.station === s) }));

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_16rem]">
        <Segmented
          label="Meal"
          value={period}
          options={periods.map((p) => ({ value: p, label: PERIOD_LABEL[p] }))}
          onChange={setPeriod}
        />
        <label className="flex h-11 items-center gap-2 border border-line px-3 transition-colors focus-within:border-ink">
          <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="7" cy="7" r="5" />
            <path d="m11 11 4 4" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search this menu"
            aria-label="Search this menu"
            className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </label>
      </div>
      {meal?.hours && <p className="mt-3 text-sm tabular-nums text-muted">Served {meal.hours}</p>}

      <div key={period} className="mt-6 animate-fade space-y-8">
        {stations.map((s) => (
          <section key={s.name} aria-label={s.name}>
            <h3 className="mb-2 flex items-baseline justify-between font-sans text-xs font-semibold uppercase tracking-[0.16em]">
              {s.name}
              <span className="font-normal tabular-nums text-muted">{s.items.length}</span>
            </h3>
            <ul className="divide-y divide-line border-y border-line">
              {s.items.map((item) => (
                <MenuRow key={item.id} item={item} startOpen={!!q && !!item.options} />
              ))}
            </ul>
          </section>
        ))}
        {!stations.length && <p className="py-8 text-center text-sm text-muted">No dishes match “{query}”.</p>}
      </div>
    </div>
  );
}

function Tags({ item }: { item: MenuItem }) {
  const tags = TAGS.filter(([t]) => item.tags.includes(t) && !(t === 'vegetarian' && item.tags.includes('vegan')));
  if (!tags.length) return null;
  return (
    <span className="ml-2 inline-flex gap-1 align-middle">
      {tags.map(([t, short, label]) => (
        <abbr key={t} title={label} className="border border-line-strong px-1 text-[0.625rem] font-semibold leading-4 tracking-wide text-muted no-underline">
          {short}
        </abbr>
      ))}
    </span>
  );
}

/** Shown under a dish whose calories or macros look like a label mistake. */
function SuspectNote({ item }: { item: MenuItem }) {
  if (!isSuspect(item)) return null;
  return <span className="mt-0.5 block text-xs text-scarlet-ink">Unusual numbers: check the label</span>;
}

function Numbers({ item }: { item: MenuItem }) {
  return (
    <span className="flex flex-col items-end gap-1 text-right">
      <span className="text-sm tabular-nums">
        <span className="font-medium">{fmt(item.calories)}</span>
        <span className="text-muted"> cal</span>
      </span>
      <span className="flex items-center gap-2.5 text-xs tabular-nums text-muted">
        {MACROS.map((m) => (
          <span key={m.key} className="flex items-center gap-1">
            <MacroShape macro={m.key} className="size-1.5" />
            {Math.round(item[m.key])}g
          </span>
        ))}
      </span>
    </span>
  );
}

function Details({ item }: { item: MenuItem }) {
  return (
    <div className="space-y-2 pb-4 text-sm">
      {item.description && <p className="text-muted">{item.description}</p>}
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs tabular-nums text-muted">
        <span>Fiber {item.fiber}g</span>
        <span>Sugar {item.sugar}g</span>
        <span>Sodium {fmt(item.sodium)}mg</span>
      </p>
      {item.allergens.length > 0 && <p className="text-xs">Contains: {item.allergens.join(', ')}</p>}
    </div>
  );
}

function MenuRow({ item, startOpen }: { item: MenuItem; startOpen: boolean }) {
  const [open, setOpen] = useState(startOpen);
  const cyo = !!item.options;
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3 text-left transition-colors hover:text-scarlet-ink"
      >
        <span className="min-w-0">
          <span className="font-medium text-ink">{item.name}</span>
          <Tags item={item} />
          <span className="mt-0.5 block text-xs text-muted">{cyo ? `${item.options!.length} options to build your own` : item.serving}</span>
          <SuspectNote item={item} />
        </span>
        {cyo ? (
          <span className="grid size-7 place-items-center border border-line-strong text-ink" aria-hidden="true">
            <svg viewBox="0 0 12 12" className={`size-2.5 transition-transform ${open ? 'rotate-45' : ''}`} stroke="currentColor" strokeWidth="1.5">
              <path d="M6 1v10M1 6h10" />
            </svg>
          </span>
        ) : (
          <Numbers item={item} />
        )}
      </button>
      {open &&
        (cyo ? (
          <ul className="mb-3 animate-fade divide-y divide-line border-l-2 border-scarlet bg-surface">
            {item.options!.map((o) => (
              <li key={o.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-2.5">
                <span className="min-w-0">
                  <span className="text-sm font-medium">{o.name}</span>
                  <Tags item={o} />
                  <span className="block text-xs text-muted">{o.serving}</span>
                  <SuspectNote item={o} />
                </span>
                <Numbers item={o} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="animate-fade">
            <Details item={item} />
          </div>
        ))}
    </li>
  );
}
