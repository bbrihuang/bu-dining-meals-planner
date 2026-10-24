// Your day, on a card with the school's band: how the plan adds up against your
// goal, in one glance. Protein, carbs and fat appear only when asked for; Edit
// opens the four boxes, and the calculator works them out for you.
import { useState } from 'react';
import { hasStored } from '../lib/storage';
import { caloriesOf, fmt, targetProblems, validTarget as valid } from '../lib/targets';
import type { Macros } from '../lib/types';
import MacroCalculator from './MacroCalculator';
import { MacroDot, MACROS } from './Shapes';

type Draft = Record<keyof Macros, string>;

const toDraft = (m: Macros): Draft => ({
  calories: String(m.calories),
  protein: String(m.protein),
  carbs: String(m.carbs),
  fat: String(m.fat),
});

function Bar({ value, target, className = 'bg-ink' }: { value: number; target: number; className?: string }) {
  const pct = target ? value / target : 0;
  return (
    <div className="h-2 overflow-hidden rounded-full bg-line" aria-hidden="true">
      <div className={`h-full rounded-full transition-[width] duration-300 ${className}`} style={{ width: `${Math.min(pct, 1) * 100}%` }} />
    </div>
  );
}

export default function TargetsPanel({
  targets,
  onChange,
  planned,
  showMacros,
  onShowMacros,
  excluded = 0,
  onBringBack,
}: {
  targets: Macros;
  onChange: (m: Macros) => void;
  /** The plan's day total, when a plan is showing. */
  planned: Macros | null;
  showMacros: boolean;
  onShowMacros: (on: boolean) => void;
  excluded?: number;
  onBringBack?: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(targets));
  const [calculating, setCalculating] = useState(false);
  const [editing, setEditing] = useState(false);
  // Nothing saved yet means the starter numbers are showing: say so.
  const [starter, setStarter] = useState(() => !hasStored('targets'));

  const edit = (key: keyof Macros, value: string) => {
    const next = { ...draft, [key]: value.replace(/[^\d]/g, '') };
    setDraft(next);
    if ((Object.keys(next) as (keyof Macros)[]).every((k) => valid(k, next[k]))) {
      onChange({ calories: +next.calories, protein: +next.protein, carbs: +next.carbs, fat: +next.fat });
      setStarter(false);
    }
  };

  const fill = (m: Macros) => {
    setDraft(toDraft(m));
    onChange(m);
    setStarter(false);
  };

  const problems = targetProblems(draft);
  const fromMacros = caloriesOf(targets);
  const off = Math.abs(fromMacros - targets.calories) / targets.calories;
  const shares = MACROS.map((m) => ({ ...m, share: ((m.key === 'fat' ? 9 : 4) * targets[m.key]) / Math.max(fromMacros, 1) }));

  return (
    <section aria-labelledby="goal-title" className="card overflow-hidden">
      <div className="h-2 bg-school" aria-hidden="true" />
      <div className="px-5 pb-4 pt-3.5 sm:pb-5">
        <div className="flex items-center justify-between gap-3">
          <h2 id="goal-title" className="text-sm font-semibold text-muted">
            {planned ? 'Your day' : 'Your daily goal'}
          </h2>
          <button
            type="button"
            onClick={() => setEditing((e) => !e)}
            aria-expanded={editing}
            aria-controls="goal-editor"
            className="button button-soft button-compact"
          >
            {editing ? 'Done' : 'Edit goal'}
          </button>
        </div>

        {planned ? (
          <>
            <p className="-mt-0.5 text-[2rem] font-bold leading-tight tracking-tight">
              {fmt(planned.calories)} <span className="text-base font-medium text-muted">of {fmt(targets.calories)} cal planned</span>
            </p>
            <div className="mt-2.5">
              <Bar value={planned.calories} target={targets.calories} />
            </div>
          </>
        ) : (
          <p className="-mt-0.5 text-[2rem] font-bold leading-tight tracking-tight">
            {fmt(targets.calories)} <span className="text-base font-medium text-muted">cal a day</span>
          </p>
        )}

        <label className="mt-3 flex w-fit cursor-pointer items-center gap-2.5 text-sm font-semibold">
          <input type="checkbox" role="switch" checked={showMacros} onChange={(e) => onShowMacros(e.target.checked)} className="peer sr-only" />
          <span
            className="relative h-6 w-10 shrink-0 rounded-full bg-line-strong transition-colors duration-150 after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-card after:shadow after:transition-transform after:duration-150 peer-checked:bg-ink peer-checked:after:translate-x-4 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink"
            aria-hidden="true"
          />
          Show protein, carbs &amp; fat
        </label>

        {showMacros && (
          <dl className="mt-3 grid animate-fade grid-cols-3 gap-3">
            {MACROS.map((m) => (
              <div key={m.key}>
                <dt className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                  <MacroDot macro={m.key} className="size-1.5" />
                  {m.label}
                </dt>
                <dd className="mt-0.5 text-sm">
                  {planned ? (
                    <>
                      <span className="font-bold">{fmt(planned[m.key])}</span>
                      <span className="text-muted"> / {fmt(targets[m.key])}g</span>
                    </>
                  ) : (
                    <span className="font-bold">{fmt(targets[m.key])}g</span>
                  )}
                </dd>
                {planned && (
                  <div className="mt-1.5">
                    <Bar value={planned[m.key]} target={targets[m.key]} className={m.bar} />
                  </div>
                )}
              </div>
            ))}
          </dl>
        )}

        {starter && !editing && (
          <p className="mt-3 text-sm text-muted">
            Typical numbers to start.{' '}
            <button type="button" onClick={() => setEditing(true)} className="font-semibold text-ink underline underline-offset-4">
              Set your own
            </button>{' '}
            or{' '}
            <button type="button" onClick={() => setCalculating(true)} className="font-semibold text-ink underline underline-offset-4">
              work them out
            </button>
            .
          </p>
        )}

        {editing && (
          <div id="goal-editor" className="mt-5 animate-fade space-y-4 border-t border-line pt-4">
            <NumberField label="Calories a day" unit="cal" value={draft.calories} invalid={!valid('calories', draft.calories)} onChange={(v) => edit('calories', v)} big />
            <div className="grid grid-cols-3 gap-2">
              {MACROS.map((m) => (
                <NumberField
                  key={m.key}
                  label={m.label}
                  unit="g"
                  value={draft[m.key]}
                  invalid={!valid(m.key, draft[m.key])}
                  onChange={(v) => edit(m.key, v)}
                  dot={m.key}
                />
              ))}
            </div>

            {/* Always in the page, so a screen reader hears the message when it appears. */}
            <div aria-live="polite">
              {problems.length > 0 && (
                <p id="targets-problems" className="rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm text-danger-ink">
                  {problems.join(' ')} Your plan is still using your last valid numbers.
                </p>
              )}
            </div>

            <div>
              <div className="flex h-2 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
                {shares.map((s) => (
                  <div key={s.key} className={`h-full transition-[width] duration-300 ${s.bar}`} style={{ width: `${s.share * 100}%` }} />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted">
                {shares.map((s) => (
                  <span key={s.key} className="flex items-center gap-1.5">
                    <MacroDot macro={s.key} className="size-1.5" />
                    {s.label} {Math.round(s.share * 100)}%
                  </span>
                ))}
              </div>
              <p className={`mt-2 text-xs ${off > 0.1 ? 'text-danger-ink' : 'text-muted'}`}>
                Your protein, carbs and fat add up to {fmt(fromMacros)} cal
                {off > 0.1 ? `, ${fromMacros > targets.calories ? 'more' : 'less'} than your calorie goal.` : '.'}
              </p>
            </div>
          </div>
        )}

        {excluded > 0 && onBringBack && (
          <p className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-surface px-3.5 py-2.5 text-sm">
            <span className="text-muted">
              {excluded} {excluded === 1 ? 'dish' : 'dishes'} ruled out
            </span>
            <button type="button" onClick={onBringBack} className="font-semibold underline underline-offset-4">
              Bring back
            </button>
          </p>
        )}

        {!starter && (
          <button type="button" onClick={() => setCalculating(true)} className="mt-3 text-sm font-semibold underline underline-offset-4">
            Not sure? Work out my numbers
          </button>
        )}
      </div>

      {planned && (
        /* The bars are only visual; this tells a screen reader when the plan changes. */
        <p role="status" className="sr-only">
          Day total: {fmt(planned.calories)} of {fmt(targets.calories)} calories, {fmt(planned.protein)} of {fmt(targets.protein)} grams of protein,{' '}
          {fmt(planned.carbs)} of {fmt(targets.carbs)} grams of carbs, {fmt(planned.fat)} of {fmt(targets.fat)} grams of fat.
        </p>
      )}

      <MacroCalculator open={calculating} onClose={() => setCalculating(false)} onApply={fill} />
    </section>
  );
}

function NumberField({
  label,
  unit,
  value,
  invalid,
  onChange,
  big = false,
  dot,
}: {
  label: string;
  unit: string;
  value: string;
  invalid: boolean;
  onChange: (v: string) => void;
  big?: boolean;
  dot?: 'protein' | 'carbs' | 'fat';
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-muted">
        {dot && <MacroDot macro={dot} className="size-1.5" />}
        {label}
      </span>
      <span className={`field mt-1.5 ${big ? 'min-h-14' : ''}`} data-invalid={invalid ? '' : undefined}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="numeric"
          aria-invalid={invalid}
          aria-describedby={invalid ? 'targets-problems' : undefined}
          className={`w-full min-w-0 bg-transparent font-semibold outline-none ${big ? 'text-2xl' : 'text-lg'}`}
        />
        <span className="text-sm text-muted">{unit}</span>
      </span>
    </label>
  );
}
