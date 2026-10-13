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
