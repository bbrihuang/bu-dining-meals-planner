// The daily targets everyone starts with, and the range each one may take.
import type { Macros } from './types';

export const DEFAULT_TARGETS: Macros = { calories: 2200, protein: 150, carbs: 230, fat: 75 };

export const TARGET_LIMITS: Record<keyof Macros, [number, number]> = {
  calories: [1000, 6000],
  protein: [20, 400],
  carbs: [0, 900],
  fat: [10, 300],
};

/** Calories implied by the macros: 4 per gram of protein and carbs, 9 per gram of fat. */
export const caloriesOf = (m: Macros) => 4 * m.protein + 4 * m.carbs + 9 * m.fat;

export const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

const NAME: Record<keyof Macros, { label: string; unit: string }> = {
  calories: { label: 'Calories', unit: ' cal' },
  protein: { label: 'Protein', unit: ' g' },
  carbs: { label: 'Carbs', unit: ' g' },
  fat: { label: 'Fat', unit: ' g' },
};

/** Is `text` a number this target accepts? */
export function validTarget(key: keyof Macros, text: string): boolean {
  const n = Number(text);
  const [min, max] = TARGET_LIMITS[key];
  return text.trim() !== '' && Number.isFinite(n) && n >= min && n <= max;
}

/**
 * One plain sentence for each box that holds a number the planner can't use, in the
 * order the boxes appear. The plan keeps the last valid targets until all four are fine.
 */
export function targetProblems(draft: Record<keyof Macros, string>): string[] {
  return (['calories', 'protein', 'carbs', 'fat'] as const).flatMap((key) => {
    if (validTarget(key, draft[key])) return [];
    const [min, max] = TARGET_LIMITS[key];
    const { label, unit } = NAME[key];
    const range = `${fmt(min)}–${fmt(max)}${unit}`;
    return [draft[key].trim() === '' ? `${label}: enter a number, ${range}.` : `${label} must be ${range}.`];
  });
}
