// The day's plan: a card for each meal with exactly what to take. Each plate can
// be swapped for another option, and any dish can be ruled out ("not this"), which
// re-plans the day without it. The planning state lives in usePlan, so the goal
// card can show how the day adds up.
import { useDeferredValue, useMemo, useState } from 'react';
import { servingState } from '../lib/data';
import { planDay, sumMacros, type PlannedMeal } from '../lib/planner';
import { formatAmount } from '../lib/portions';
import { fmt } from '../lib/targets';
import { PERIOD_LABEL, type HallDay, type Macros, type Period, type PlateItem } from '../lib/types';
import { DietTags, StateChip } from './ui';

/** Plans `day` against `targets`; choices and ruled-out dishes reset when `dayKey` changes. */
export function usePlan(day: HallDay | null, targets: Macros, dayKey: string | null) {
  const [key, setKey] = useState(dayKey);
  const [choices, setChoices] = useState<Partial<Record<Period, number>>>({});
  const [excluded, setExcluded] = useState<Set<string>>(() => new Set());
  if (key !== dayKey) {
    setKey(dayKey);
    setChoices({});
    setExcluded(new Set());
  }
  // Planning takes a few milliseconds; keep typing in the targets smooth.
  const daily = useDeferredValue(targets);
  const meals = useMemo(() => (day ? planDay({ day, daily, choices, excluded }) : []), [day, daily, choices, excluded]);
  const total = day ? sumMacros(meals.flatMap((m) => m.plate?.items ?? [])) : null;

  return {
    meals,
    total,
    excluded: excluded.size,
    next: (meal: PlannedMeal) => setChoices((c) => ({ ...c, [meal.period]: (meal.choice + 1) % meal.options.length })),
    // Ruling a dish out re-plans its own meal from the first option; other meals keep theirs.
    exclude: (period: Period, id: string) => {
      setExcluded((s) => new Set(s).add(id));
      setChoices((c) => ({ ...c, [period]: 0 }));
    },
    bringBack: () => setExcluded(new Set()),
  };
}

export default function MealPlan({
  day,
  plan,
  timeZone,
  showMacros,
}: {
  day: HallDay;
  plan: ReturnType<typeof usePlan>;
  /** Set when the day is today, so each meal can say whether it's being served. */
  timeZone: string | null;
  showMacros: boolean;
}) {
  return (
    <div className="space-y-4">
      {plan.meals.map((meal) => (
        <MealCard
          key={meal.period}
          meal={meal}
          hours={day[meal.period]?.hours}
          state={servingState(day[meal.period]?.hours, timeZone)}
          showMacros={showMacros}
          onNext={() => plan.next(meal)}
          onExclude={(id) => plan.exclude(meal.period, id)}
        />
      ))}
    </div>
  );
}

function MealCard({
  meal,
  hours,
  state,
  showMacros,
  onNext,
  onExclude,
}: {
  meal: PlannedMeal;
  hours?: string;
  state: ReturnType<typeof servingState>;
  showMacros: boolean;
  onNext: () => void;
  onExclude: (id: string) => void;
}) {
  const { period, plate, options, choice } = meal;
  return (
    <article className="card overflow-hidden" aria-labelledby={`meal-${period}`}>
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 px-5 pb-2 pt-4">
        <div className="flex items-center gap-2.5">
          <h3 id={`meal-${period}`} className="text-xl font-bold tracking-tight">
            {PERIOD_LABEL[period]}
          </h3>
          <StateChip state={state} />
        </div>
        {hours && <span className="text-sm text-muted">{hours}</span>}
      </header>

      {plate ? (
        <ul key={choice} className="plate-in px-2">
          {plate.items.map((p) => (
            <PlateRow key={p.item.id} entry={p} showMacros={showMacros} onExclude={() => onExclude(p.item.id)} />
          ))}
        </ul>
      ) : (
        <p className="px-5 py-4 text-sm text-muted">Nothing left on this menu fits. Bring back some ruled-out dishes to see a plate.</p>
      )}

      <footer className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
        <p className="text-sm">
          <span className="font-bold">{fmt(plate?.macros.calories ?? 0)}</span>
          <span className="text-muted"> cal</span>
          {showMacros && plate && (
            <span className="text-muted">
              {' '}
              · {Math.round(plate.macros.protein)}g protein · {Math.round(plate.macros.carbs)}g carbs · {Math.round(plate.macros.fat)}g fat
            </span>
          )}
        </p>
        {options.length > 1 && (
          <button type="button" onClick={onNext} className="button button-soft button-compact group min-h-10">
            <svg viewBox="0 0 16 16" className="size-3.5 transition-transform duration-300 group-active:rotate-180" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
              <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2v3.5H10" />
            </svg>
            Another option
            <span className="font-medium text-muted">
              {choice + 1} of {options.length}
            </span>
          </button>
        )}
      </footer>
    </article>
  );
}

function PlateRow({ entry, showMacros, onExclude }: { entry: PlateItem; showMacros: boolean; onExclude: () => void }) {
  const { item, servings } = entry;
  const m = sumMacros([entry]);
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-start gap-x-2 rounded-xl px-3 py-2.5">
      <div className="min-w-0">
        <p className="leading-snug">
          <span className="font-bold">{formatAmount(item, servings)}</span> <span className="font-medium">{item.name}</span>
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
          <span>{item.from ? `${item.station} · ${item.from}` : item.station}</span>
          <DietTags tags={item.tags} />
        </p>
        {showMacros && (
          <p className="mt-0.5 text-xs text-muted">
            {Math.round(m.protein)}g protein · {Math.round(m.carbs)}g carbs · {Math.round(m.fat)}g fat
          </p>
        )}
      </div>
      <span className="pt-0.5 text-sm">
        <span className="font-semibold">{fmt(m.calories)}</span>
        <span className="text-muted"> cal</span>
      </span>
      <button
        type="button"
        onClick={onExclude}
        title="Not this: plan without it"
        aria-label={`Not this: plan without ${item.name}`}
        className="-my-2 -mr-1 grid size-11 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink active:scale-95"
      >
        <svg viewBox="0 0 12 12" className="size-3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
          <path d="M2 2l8 8M10 2 2 10" />
        </svg>
      </button>
    </li>
  );
}
