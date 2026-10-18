// The day's plan: a summary against the targets, then a plate for each meal. Each
// plate can be swapped for another option, and any dish can be ruled out ("not
// this"), which re-plans the day without it.
import { useDeferredValue, useMemo, useState } from 'react';
import { planDay, sumMacros, type PlannedMeal } from '../lib/planner';
import { formatAmount } from '../lib/portions';
import { fmt } from '../lib/targets';
import { PERIOD_LABEL, type HallDay, type Macros, type Period, type PlateItem } from '../lib/types';
import { MacroShape, MACROS, PeriodGlyph } from './Shapes';

export default function MealPlan({ day, targets, source }: { day: HallDay; targets: Macros; /** The school whose menus these are. */ source: string }) {
  const [choices, setChoices] = useState<Partial<Record<Period, number>>>({});
  const [excluded, setExcluded] = useState<Set<string>>(() => new Set());
  // Planning takes a few milliseconds; keep typing in the targets smooth.
  const daily = useDeferredValue(targets);
  const meals = useMemo(() => planDay({ day, daily, choices, excluded }), [day, daily, choices, excluded]);
  const total = sumMacros(meals.flatMap((m) => m.plate?.items ?? []));

  const exclude = (id: string) => {
    setExcluded((s) => new Set(s).add(id));
    setChoices({});
  };

  return (
    <div className="space-y-4">
      <DaySummary total={total} targets={targets} source={source} excluded={excluded.size} onReset={() => setExcluded(new Set())} />
      {meals.map((meal, i) => (
        <MealCard
          key={meal.period}
          index={i}
          meal={meal}
          hours={day[meal.period]?.hours}
          onNext={() => setChoices((c) => ({ ...c, [meal.period]: (meal.choice + 1) % meal.options.length }))}
          onExclude={exclude}
        />
      ))}
    </div>
  );
}

function DaySummary({ total, targets, source, excluded, onReset }: { total: Macros; targets: Macros; source: string; excluded: number; onReset: () => void }) {
  const rows = [
    { key: 'calories' as const, label: 'Calories', unit: '', bar: 'bg-scarlet', shape: null },
    ...MACROS.map((m) => ({ key: m.key, label: m.label, unit: 'g', bar: m.bar, shape: m.key })),
  ];
  return (
    <section aria-label="Day total" className="border border-line">
      <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
        {rows.map((r) => {
          const pct = targets[r.key] ? total[r.key] / targets[r.key] : 0;
          return (
            <div key={r.key} className="bg-bg px-4 py-4 sm:px-5">
              <p className="flex items-center gap-1.5 text-xs text-muted">
                {r.shape && <MacroShape macro={r.shape} />}
                {r.label}
              </p>
              <p className="mt-1.5 font-display tabular-nums">
                <span className={`font-semibold tracking-tight ${r.key === 'calories' ? 'text-3xl' : 'text-2xl'}`}>{fmt(total[r.key])}</span>
                <span className="text-sm text-muted">
                  {' '}
                  / {fmt(targets[r.key])}
                  {r.unit}
                </span>
              </p>
              <div className="relative mt-3 h-1 bg-line" aria-hidden="true">
                <div className={`h-full transition-[width] duration-500 ${r.bar}`} style={{ width: `${Math.min(pct, 1) * 100}%` }} />
              </div>
              <p className="mt-1.5 text-xs tabular-nums text-muted">{Math.round(pct * 100)}% of target</p>
            </div>
          );
        })}
      </div>
      {excluded > 0 && (
        <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-2.5 text-sm">
          <span className="text-muted">
            {excluded} {excluded === 1 ? 'dish' : 'dishes'} ruled out
          </span>
          <button type="button" onClick={onReset} className="font-medium underline decoration-line-strong underline-offset-4 hover:decoration-ink">
            Bring back
          </button>
        </div>
      )}
      <p className="border-t border-line px-5 py-2.5 text-xs text-muted">Numbers come from {source}’s published dining menus and are estimates.</p>
      {/* The tiles are only visual; this tells a screen reader when the plan changes. */}
      <p role="status" className="sr-only">
        Day total: {fmt(total.calories)} of {fmt(targets.calories)} calories, {fmt(total.protein)} of {fmt(targets.protein)} grams of protein, {fmt(total.carbs)} of{' '}
        {fmt(targets.carbs)} grams of carbs, {fmt(total.fat)} of {fmt(targets.fat)} grams of fat.
      </p>
    </section>
  );
}

function MealCard({
  index,
  meal,
  hours,
  onNext,
  onExclude,
}: {
  index: number;
  meal: PlannedMeal;
  hours?: string;
  onNext: () => void;
  onExclude: (id: string) => void;
}) {
  const { period, plate, options, choice, target } = meal;
  return (
    <article className="animate-rise border border-line" style={{ animationDelay: `${index * 70}ms` }}>
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="font-display text-sm tabular-nums text-muted">0{index + 1}</span>
          <PeriodGlyph period={period} />
          <h3 className="text-xl font-semibold tracking-tight">{PERIOD_LABEL[period]}</h3>
        </div>
        {hours && <span className="text-sm tabular-nums text-muted">{hours}</span>}
      </header>

      {plate ? (
        <ul key={choice} className="animate-fade divide-y divide-line">
          {plate.items.map((p) => (
            <PlateRow key={p.item.id} entry={p} onExclude={() => onExclude(p.item.id)} />
          ))}
        </ul>
      ) : (
        <p className="px-5 py-6 text-sm text-muted">Nothing left on this menu fits. Bring back some ruled-out dishes to see a plate.</p>
      )}

      <footer className="flex flex-wrap items-center justify-between gap-3 bg-surface px-5 py-3">
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm tabular-nums">
          <span>
            <span className="font-display font-semibold">{fmt(plate?.macros.calories ?? 0)}</span>
            <span className="text-muted"> / {fmt(target.calories)} cal</span>
          </span>
          {MACROS.map((m) => (
            <span key={m.key} className="flex items-center gap-1.5">
              <MacroShape macro={m.key} className="size-2" />
              {Math.round(plate?.macros[m.key] ?? 0)}g
            </span>
          ))}
        </p>
        {options.length > 1 && (
          <button
            type="button"
            onClick={onNext}
            className="group flex items-center gap-2 border border-line-strong bg-bg px-3 py-1.5 text-sm font-medium transition-colors hover:border-ink"
          >
            <svg viewBox="0 0 16 16" className="size-3.5 transition-transform duration-500 group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2v3.5H10" />
            </svg>
            Another option
            <span className="tabular-nums text-muted">
              {choice + 1}/{options.length}
            </span>
          </button>
        )}
      </footer>
    </article>
  );
}

function PlateRow({ entry, onExclude }: { entry: PlateItem; onExclude: () => void }) {
  const { item, servings } = entry;
  const m = sumMacros([entry]);
  return (
    <li className="grid grid-cols-[5rem_minmax(0,1fr)_auto] items-start gap-x-4 px-5 py-3.5">
      <span className="pt-0.5 font-display text-sm font-semibold tabular-nums">{formatAmount(item, servings)}</span>
      <div className="min-w-0">
        <p className="font-medium leading-snug">{item.name}</p>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
          <span>{item.from ? `${item.station} · ${item.from}` : item.station}</span>
          <span className="flex items-center gap-2.5 tabular-nums">
            {MACROS.map((x) => (
              <span key={x.key} className="flex items-center gap-1">
                <MacroShape macro={x.key} className="size-1.5" />
                {Math.round(m[x.key])}g
              </span>
            ))}
          </span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="pt-0.5 text-sm tabular-nums">
          <span className="font-medium">{fmt(m.calories)}</span>
          <span className="text-muted"> cal</span>
        </span>
        <button
          type="button"
          onClick={onExclude}
          title="Not this: plan without it"
          aria-label={`Plan without ${item.name}`}
          className="grid size-7 place-items-center border border-transparent text-muted transition-colors hover:border-line-strong hover:text-scarlet-ink"
        >
          <svg viewBox="0 0 12 12" className="size-2.5" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M1 1l10 10M11 1 1 11" />
          </svg>
        </button>
      </div>
    </li>
  );
}
