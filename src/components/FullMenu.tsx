// Everything the hall serves at one meal, grouped by station, with each dish's
// calories and macros. Tap a dish for its details, or a "Create Your Own" station
// for its options.
import { useState } from 'react';
import { isSuspect } from '../lib/classify';
import { minutesNow, parseHours, servingState } from '../lib/data';
import { fmt } from '../lib/targets';
import { PERIOD_LABEL, PERIODS, type HallDay, type MenuItem, type Period } from '../lib/types';
import { DietTags, Segmented, StateChip } from './ui';

/** The meal being served now, or the next one today; else the first. */
function defaultPeriod(day: HallDay, periods: Period[], timeZone: string | null): Period {
  if (!timeZone) return periods[0];
  const now = minutesNow(timeZone);
  return periods.find((p) => (parseHours(day[p]?.hours)?.[1] ?? 0) > now) ?? periods[0];
}

export default function FullMenu({
  day,
  timeZone,
  showMacros,
}: {
  day: HallDay;
  /** Set when the day is today. */
  timeZone: string | null;
  /** Protein, carbs and fat per dish, only when the reader has asked for them. */
  showMacros: boolean;
}) {
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
      <div className="card space-y-3 p-4">
        <Segmented label="Meal" value={period} options={periods.map((p) => ({ value: p, label: PERIOD_LABEL[p] }))} onChange={setPeriod} />
        <label className="field">
          <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
            <circle cx="7" cy="7" r="5" />
            <path d="m11 11 4 4" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search this menu"
            aria-label="Search this menu"
            className="w-full min-w-0 bg-transparent outline-none placeholder:text-muted"
          />
        </label>
        {meal?.hours && (
          <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
            Served {meal.hours}
            <StateChip state={servingState(meal.hours, timeZone)} />
          </p>
        )}
      </div>

      <div key={period} className="mt-4 animate-fade space-y-4">
        {stations.map((s) => (
          <section key={s.name} aria-labelledby={`st-${s.name}`} className="card px-2 py-2">
            <h3 id={`st-${s.name}`} className="flex items-baseline justify-between px-3 pb-1 pt-2 text-base font-bold">
              {s.name}
              <span className="text-sm font-medium text-muted">
                {s.items.length} {s.items.length === 1 ? 'dish' : 'dishes'}
              </span>
            </h3>
            <ul>
              {s.items.map((item) => (
                <MenuRow key={item.id} item={item} startOpen={!!q && !!item.options} showMacros={showMacros} />
              ))}
            </ul>
          </section>
        ))}
        {!stations.length && <p className="py-8 text-center text-sm text-muted">No dishes match “{query}”.</p>}
      </div>
    </div>
  );
}

/** Shown under a dish whose calories or macros look like a label mistake. */
function SuspectNote({ item }: { item: MenuItem }) {
  if (!isSuspect(item)) return null;
  return <span className="mt-0.5 block text-xs font-medium text-danger-ink">Unusual numbers: check the label</span>;
}

/** Protein, carbs and fat for one serving, spelled out. */function MacroLine({ item }: { item: MenuItem }) {  return (    <span className="mt-0.5 block text-xs text-muted">      {Math.round(item.protein)}g protein · {Math.round(item.carbs)}g carbs · {Math.round(item.fat)}g fat    </span>  );}
function Numbers({ item }: { item: MenuItem }) {
  return (
    <span className="flex flex-col items-end text-right">
      <span className="text-sm">
        <span className="font-semibold">{fmt(item.calories)}</span>
        <span className="text-muted"> cal</span>
      </span>
    </span>
  );
}

function Details({ item }: { item: MenuItem }) {
  return (
    <div className="space-y-1.5 px-3 pb-3 text-sm">
      {item.description && <p className="text-muted">{item.description}</p>}
      <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <span>Fiber {item.fiber}g</span>
        <span>Sugar {item.sugar}g</span>
        <span>Sodium {fmt(item.sodium)}mg</span>
      </p>
      {item.allergens.length > 0 && <p className="text-xs">Contains: {item.allergens.join(', ')}. With a serious allergy, check with the dining staff.</p>}
    </div>
  );
}

function MenuRow({ item, startOpen, showMacros }: { item: MenuItem; startOpen: boolean; showMacros: boolean }) {
  const [open, setOpen] = useState(startOpen);
  const cyo = !!item.options;
  return (
    <li className={`rounded-xl transition-colors ${open ? 'bg-surface' : ''}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="grid min-h-12 w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-surface"
      >
        <span className="min-w-0">
          <span className="font-semibold">{item.name}</span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
            {cyo ? `Build your own · ${item.options!.length} options` : item.serving}
            <DietTags tags={item.tags} />
          </span>
          {showMacros && !cyo && <MacroLine item={item} />}
          <SuspectNote item={item} />
        </span>
        {cyo ? (
          <span className="grid size-8 place-items-center rounded-full bg-surface text-ink" aria-hidden="true">
            <svg viewBox="0 0 12 12" className={`size-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="m2.5 4.5 3.5 3.5 3.5-3.5" />
            </svg>
          </span>
        ) : (
          <Numbers item={item} />
        )}
      </button>
      {open &&
        (cyo ? (
          <ul className="animate-fade px-1 pb-2">
            {item.options!.map((o) => (
              <li key={o.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-lg px-3 py-2">
                <span className="min-w-0">
                  <span className="text-sm font-semibold">{o.name}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                    {o.serving}
                    <DietTags tags={o.tags} />
                  </span>
                  {showMacros && <MacroLine item={o} />}
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
