// Daily targets: calories plus protein, carbs and fat, typed in or filled by the
// calculator. On phones it folds into a one-line summary above the plan.
import { useState } from 'react';
import { caloriesOf, fmt, targetProblems, validTarget as valid } from '../lib/targets';
import type { Macros } from '../lib/types';
import MacroCalculator from './MacroCalculator';
import { MacroShape, MACROS } from './Shapes';

type Draft = Record<keyof Macros, string>;

const toDraft = (m: Macros): Draft => ({
  calories: String(m.calories),
  protein: String(m.protein),
  carbs: String(m.carbs),
  fat: String(m.fat),
});

/** The inputs have no outline of their own, so the whole box they sit in shows where you are. */
const FOCUS_CELL = 'has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-scarlet';

export default function TargetsPanel({ targets, onChange }: { targets: Macros; onChange: (m: Macros) => void }) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(targets));
  const [calculating, setCalculating] = useState(false);
  const [open, setOpen] = useState(false);
  // Bumped when the calculator fills the fields, so they can flash.
  const [filled, setFilled] = useState(0);

  const edit = (key: keyof Macros, value: string) => {
    const next = { ...draft, [key]: value.replace(/[^\d]/g, '') };
    setDraft(next);
    if ((Object.keys(next) as (keyof Macros)[]).every((k) => valid(k, next[k]))) {
      onChange({ calories: +next.calories, protein: +next.protein, carbs: +next.carbs, fat: +next.fat });
    }
  };

  const fill = (m: Macros) => {
    setDraft(toDraft(m));
    onChange(m);
    setFilled((n) => n + 1);
  };

  const problems = targetProblems(draft);
  const fromMacros = caloriesOf(targets);
  const off = Math.abs(fromMacros - targets.calories) / targets.calories;
  const shares = MACROS.map((m) => ({ ...m, share: ((m.key === 'fat' ? 9 : 4) * targets[m.key]) / Math.max(fromMacros, 1) }));

  return (
    <section aria-labelledby="targets-title" className="border border-line">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 id="targets-title" className="whitespace-nowrap font-sans text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          <span className="hidden sm:inline">Daily </span>targets
        </h2>
        {/* Phones: show the numbers in one line and fold the editor away. */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="targets-body"
          className="relative flex min-w-0 items-center gap-2 text-sm font-medium after:absolute after:inset-x-0 after:-inset-y-4 lg:hidden"
        >
          <span className="flex min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap tabular-nums">
            <span>
              <span className="font-display font-semibold">{fmt(targets.calories)}</span>
              <span className="text-muted"> cal</span>
            </span>
            {MACROS.map((m) => (
              <span key={m.key} className="flex items-center gap-1 text-muted">
                <MacroShape macro={m.key} className="size-2" />
                {targets[m.key]}
              </span>
            ))}
            <span className="sr-only">grams of protein, carbs and fat</span>
          </span>
          <svg viewBox="0 0 12 12" className={`size-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="m2 4 4 4 4-4" />
          </svg>
        </button>
      </div>

      <div id="targets-body" className={`${open ? 'block' : 'hidden'} lg:block`}>
        <label key={`cal-${filled}`} className={`block border-b border-line px-5 py-4 ${FOCUS_CELL} ${filled ? 'animate-fade' : ''}`}>
          <span className="text-sm text-muted">Calories</span>
          <span className="mt-1 flex items-baseline gap-2">
            <input
              value={draft.calories}
              onChange={(e) => edit('calories', e.target.value)}
              inputMode="numeric"
              aria-invalid={!valid('calories', draft.calories)}
              aria-describedby={valid('calories', draft.calories) ? undefined : 'targets-problems'}
              className="w-full min-w-0 bg-transparent font-display text-5xl font-semibold tabular-nums tracking-tight outline-none aria-[invalid=true]:text-scarlet-ink"
            />
            <span className="text-sm text-muted">cal</span>
          </span>
        </label>

        <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
          {MACROS.map((m) => (
            <label key={`${m.key}-${filled}`} className={`block px-4 py-3.5 ${FOCUS_CELL} ${filled ? 'animate-fade' : ''}`}>
              <span className="flex items-center gap-1.5 text-xs text-muted">
                <MacroShape macro={m.key} />
                {m.label}
              </span>
              <span className="mt-1 flex items-baseline gap-1">
                <input
                  value={draft[m.key]}
                  onChange={(e) => edit(m.key, e.target.value)}
                  inputMode="numeric"
                  aria-invalid={!valid(m.key, draft[m.key])}
                  aria-describedby={valid(m.key, draft[m.key]) ? undefined : 'targets-problems'}
                  className="w-full min-w-0 bg-transparent font-display text-2xl font-semibold tabular-nums outline-none aria-[invalid=true]:text-scarlet-ink"
                />
                <span className="text-xs text-muted">g</span>
              </span>
            </label>
          ))}
        </div>

        {/* Always in the page, so a screen reader hears the message when it appears. */}
        <div aria-live="polite">
          {problems.length > 0 && (
            <p id="targets-problems" className="border-b border-line px-5 py-3 text-sm text-scarlet-ink">
              {problems.join(' ')} Your plan is still using your last valid targets.
            </p>
          )}
        </div>

        <div className="px-5 py-4">
          <div className="flex h-2 gap-0.5" aria-hidden="true">
            {shares.map((s) => (
              <div key={s.key} className={`h-full transition-[width] duration-500 ${s.bar}`} style={{ width: `${s.share * 100}%` }} />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs tabular-nums text-muted">
            {shares.map((s) => (
              <span key={s.key}>
                {s.short} {Math.round(s.share * 100)}%
              </span>
            ))}
          </div>
          <p className={`mt-3 text-xs ${off > 0.1 ? 'text-scarlet-ink' : 'text-muted'}`}>
            Your macros add up to {fmt(fromMacros)} cal
            {off > 0.1 ? `, ${fromMacros > targets.calories ? 'more' : 'less'} than your calorie target.` : '.'}
          </p>
        </div>

        <div className="border-t border-line p-3">
          <button
            type="button"
            onClick={() => setCalculating(true)}
            className="group flex h-11 w-full items-center justify-center gap-2 bg-ink text-sm font-semibold text-bg transition-colors hover:bg-scarlet hover:text-on-scarlet"
          >
            <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden="true">
              <rect x="1" y="1" width="6" height="6" />
              <circle cx="12" cy="4" r="3" />
              <path d="M4 9l3.5 6h-7z" />
              <path d="M9 11.25h6v1.5H9z" />
            </svg>
            Calculate my macros
          </button>
        </div>
      </div>

      <MacroCalculator open={calculating} onClose={() => setCalculating(false)} onApply={fill} />
    </section>
  );
}
