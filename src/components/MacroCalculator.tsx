// "Calculate my macros": body stats, activity, goal, and macro balance in, daily
// targets out (math in lib/macros.ts). Targets update live as you type; "Use these
// targets" fills them in. Answers are remembered in this browser.
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import {
  calculateMacros,
  FAT_SHARE,
  GOALS,
  inToCm,
  kgToLb,
  lbToKg,
  PROTEIN_PER_LB,
  stepTier,
  type Body,
  type GoalId,
  type Sex,
} from '../lib/macros';
import { load, save } from '../lib/storage';
import { fmt } from '../lib/targets';
import type { Macros } from '../lib/types';
import { MacroDot, MACROS } from './Shapes';
import { Segmented } from './ui';

interface Form {
  units: 'imperial' | 'metric';
  sex: Sex;
  age: string;
  feet: string;
  inches: string;
  cm: string;
  /** Weights are typed in the chosen unit. */
  weight: string;
  goalWeight: string;
  bodyFat: string;
  steps: number;
  trainingDays: number;
  goal: GoalId;
  proteinPerLb: number;
  fatShare: number;
}

const BLANK: Form = {
  units: 'imperial',
  sex: 'male',
  age: '',
  feet: '',
  inches: '',
  cm: '',
  weight: '',
  goalWeight: '',
  bodyFat: '',
  steps: 8000,
  trainingDays: 3,
  goal: 'maintain',
  proteinPerLb: 1,
  fatShare: 0.3,
};

const num = (s: string) => (s.trim() === '' ? NaN : Number(s));

/** Converts what's typed when the units change, so nothing has to be retyped. */
function switchUnits(f: Form, units: Form['units']): Form {
  if (units === f.units) return f;
  const round = (n: number, places = 0) => String(Math.round(n * 10 ** places) / 10 ** places);
  const weight = (s: string) => {
    const n = num(s);
    if (!Number.isFinite(n)) return s;
    return units === 'metric' ? round(lbToKg(n), 1) : round(kgToLb(n));
  };
  let { feet, inches, cm } = f;
  if (units === 'metric') {
    const total = num(f.feet) * 12 + (num(f.inches) || 0);
    if (Number.isFinite(total)) cm = round(inToCm(total));
  } else {
    const totalIn = Math.round(num(f.cm) / 2.54);
    if (Number.isFinite(totalIn)) {
      feet = String(Math.floor(totalIn / 12));
      inches = String(totalIn % 12);
    }
  }
  return { ...f, units, feet, inches, cm, weight: weight(f.weight), goalWeight: weight(f.goalWeight) };
}

/** The body the form describes, or what's still missing. */
function toBody(f: Form): Body | string {
  const toKg = (s: string) => (f.units === 'imperial' ? lbToKg(num(s)) : num(s));
  const age = num(f.age);
  if (!(age >= 16 && age <= 80)) return 'Enter your age (16–80).';
  const heightCm = f.units === 'imperial' ? inToCm(num(f.feet) * 12 + (num(f.inches) || 0)) : num(f.cm);
  if (!(heightCm >= 120 && heightCm <= 230)) return 'Enter your height.';
  const weightKg = toKg(f.weight);
  if (!(weightKg >= 35 && weightKg <= 250)) return 'Enter your weight.';
  const goalWeightKg = f.goalWeight.trim() ? toKg(f.goalWeight) : undefined;
  if (goalWeightKg !== undefined && !(goalWeightKg >= 35 && goalWeightKg <= 250)) return 'Check your goal weight.';
  const bodyFatPct = f.bodyFat.trim() ? num(f.bodyFat) : undefined;
  if (bodyFatPct !== undefined && !(bodyFatPct >= 3 && bodyFatPct <= 60)) return 'Body fat should be between 3% and 60%.';
  return { ...f, age, heightCm, weightKg, goalWeightKg, bodyFatPct };
}

export default function MacroCalculator({ open, onClose, onApply }: { open: boolean; onClose: () => void; onApply: (m: Macros) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [form, setForm] = useState<Form>(() => load('macroForm', BLANK));
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const body = toBody(form);
  const result = typeof body === 'string' ? null : calculateMacros(body);
  const wUnit = form.units === 'imperial' ? 'lb' : 'kg';

  const apply = () => {
    if (!result) return;
    save('macroForm', form);
    onApply(result.macros);
    onClose();
  };

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && onClose()}
      className="sheet mx-auto mb-0 mt-auto max-h-[92dvh] w-full max-w-[40rem] overflow-y-auto rounded-t-3xl bg-card p-0 text-ink shadow-card sm:m-auto sm:max-h-[min(92dvh,56rem)] sm:w-[min(100%-1.5rem,40rem)] sm:rounded-3xl"
    >
      <form
        method="dialog"
        onSubmit={(e) => {
          e.preventDefault();
          apply();
        }}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-card px-6 py-5">
          <div>
            <h2 id={titleId} className="text-2xl font-bold tracking-tight">
              Work out my numbers
            </h2>
            <p className="mt-1 text-sm text-muted">Daily targets from your body, activity and goal.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-11 shrink-0 place-items-center rounded-full bg-surface hover:bg-line">
            <svg viewBox="0 0 12 12" className="size-3" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M1 1l10 10M11 1 1 11" />
            </svg>
          </button>
        </div>

        <div className="space-y-8 px-6 py-6">
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <Segmented
              label="Units"
              value={form.units}
              options={[
                { value: 'imperial', label: 'lb · ft' },
                { value: 'metric', label: 'kg · cm' },
              ]}
              onChange={(v) => setForm((f) => switchUnits(f, v))}
            />
            <Segmented
              label="Sex"
              value={form.sex}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ]}
              onChange={(v) => set('sex', v)}
            />
          </div>

          <Step n={1} title="Body">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Field label="Age" value={form.age} onChange={(v) => set('age', v)} unit="yrs" />
              {form.units === 'imperial' ? (
                <div>
                  <span className="text-sm text-muted">Height</span>
                  <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                    <NumberBox label="Height, feet" unit="ft" value={form.feet} onChange={(v) => set('feet', v)} />
                    <NumberBox label="Height, inches" unit="in" value={form.inches} onChange={(v) => set('inches', v)} />
                  </div>
                </div>
              ) : (
                <Field label="Height" unit="cm" value={form.cm} onChange={(v) => set('cm', v)} />
              )}
              <Field label="Weight" unit={wUnit} value={form.weight} onChange={(v) => set('weight', v)} />
              <Field label="Goal weight" hint="optional" unit={wUnit} value={form.goalWeight} onChange={(v) => set('goalWeight', v)} />
              <Field label="Body fat" hint="optional" unit="%" value={form.bodyFat} onChange={(v) => set('bodyFat', v)} />
            </div>
          </Step>

          <Step n={2} title="Activity">
            <Slider
              label="Daily steps"
              min={0}
              max={20000}
              step={500}
              value={form.steps}
              onChange={(v) => set('steps', v)}
              display={`${form.steps.toLocaleString()} · ${stepTier(form.steps)}`}
            />
            <div className="mt-5">
              <span className="text-sm text-muted">Workouts per week</span>
              <div className="mt-2 grid grid-cols-8 gap-1.5" role="radiogroup" aria-label="Workouts per week">
                {Array.from({ length: 8 }, (_, d) => (
                  <button
                    key={d}
                    type="button"
                    role="radio"
                    aria-checked={form.trainingDays === d}
                    onClick={() => set('trainingDays', d)}
                    className={`h-11 rounded-xl text-sm font-semibold transition-colors ${
                      form.trainingDays === d ? 'bg-ink text-card' : 'bg-surface text-muted hover:text-ink'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </Step>

          <Step n={3} title="Goal">
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5" role="radiogroup" aria-label="Goal">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  role="radio"
                  aria-checked={form.goal === g.id}
                  onClick={() => set('goal', g.id)}
                  className={`rounded-xl px-2 py-2.5 text-center transition-colors ${
                    form.goal === g.id ? 'bg-ink text-card' : 'bg-surface hover:bg-line'
                  } ${g.id === 'maintain' ? 'col-span-2 sm:col-span-1' : ''}`}
                >
                  <span className="block text-sm font-semibold">{g.label}</span>
                  <span className={`block text-xs tabular-nums ${form.goal === g.id ? 'opacity-85' : 'text-muted'}`}>
                    {g.delta > 0 ? '+' : g.delta < 0 ? '−' : '±'}
                    {Math.abs(g.delta)} cal
                  </span>
                </button>
              ))}
            </div>
          </Step>

          <Step n={4} title="Macro balance">
            <Slider
              label="Protein"
              min={PROTEIN_PER_LB[0]}
              max={PROTEIN_PER_LB[1]}
              step={0.05}
              value={form.proteinPerLb}
              onChange={(v) => set('proteinPerLb', v)}
              display={`${form.proteinPerLb.toFixed(2)} g per lb of ${form.goalWeight.trim() ? 'goal' : 'body'} weight`}
            />
            <div className="mt-5">
              <Slider
                label="Fat ↔ carbs"
                min={FAT_SHARE[0]}
                max={FAT_SHARE[1]}
                step={0.01}
                value={form.fatShare}
                onChange={(v) => set('fatShare', v)}
                display={`${Math.round(form.fatShare * 100)}% of calories from fat`}
                ends={['More carbs', 'More fat']}
              />
            </div>
          </Step>
        </div>

        <div className="sticky bottom-0 border-t border-line bg-card px-6 py-5" aria-live="polite">
          {result ? (
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
              <div>
                <p className="text-sm font-semibold text-muted">Your daily goal</p>
                <p className="mt-0.5 text-4xl font-bold tracking-tight">
                  {fmt(result.macros.calories)} <span className="text-base font-medium text-muted">cal</span>
                </p>
              </div>
              <div className="flex gap-5 pb-1">
                {MACROS.map((m) => (
                  <div key={m.key}>
                    <p className="flex items-center gap-1.5 text-xs text-muted">
                      <MacroDot macro={m.key} className="size-1.5" /> {m.label}
                    </p>
                    <p className="text-lg font-bold">{result.macros[m.key]}g</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">{body as string}</p>
          )}
          {result?.floored && (
            <p className="mt-3 text-xs text-muted">
              We don’t go below {fmt(result.macros.calories)} calories a day. For a bigger deficit, talk to a doctor or dietitian.
            </p>
          )}
          <button
            type="submit"
            disabled={!result}
            className="button button-ink mt-4 h-12 w-full disabled:cursor-not-allowed disabled:opacity-35"
          >
            Use these numbers
          </button>
          <p className="mt-2 text-center text-xs text-muted">An estimate for healthy adults, not medical advice.</p>
        </div>
      </form>
    </dialog>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-4 flex items-center gap-3 text-base font-bold">
        <span className="grid size-7 place-items-center rounded-full bg-surface text-sm font-bold">{n}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field(props: { label: string; hint?: string; unit?: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm text-muted">
        {props.label}
        {props.hint && <span> · {props.hint}</span>}
      </span>
      <NumberBox {...props} className="mt-1.5" />
    </label>
  );
}

function NumberBox(props: { label?: string; unit?: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <div className={`field ${props.className ?? ''}`}>
      <input
        type="text"
        inputMode="decimal"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value.replace(/[^\d.]/g, ''))}
        aria-label={props.label}
        className="w-full min-w-0 bg-transparent font-semibold outline-none"
      />
      {props.unit && <span className="pl-1 text-sm text-muted">{props.unit}</span>}
    </div>
  );
}

function Slider(props: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  display: string;
  onChange: (v: number) => void;
  ends?: [string, string];
}) {
  const fill = ((props.value - props.min) / (props.max - props.min)) * 100;
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-muted">{props.label}</span>
        <span className="font-medium tabular-nums">{props.display}</span>
      </span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        className="range mt-2 w-full"
        style={{ '--fill': `${fill}%` } as React.CSSProperties}
      />
      {props.ends && (
        <span className="flex justify-between text-xs text-muted">
          <span>{props.ends[0]}</span>
          <span>{props.ends[1]}</span>
        </span>
      )}
    </label>
  );
}
