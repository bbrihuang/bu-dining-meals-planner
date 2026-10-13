// "Calculate my macros": daily calories and macros from someone's body, activity
// and goal.
//
// Calories: resting burn (Katch-McArdle when body fat % is known, otherwise
// Mifflin-St Jeor) × an activity factor from daily steps and training days, plus
// or minus the goal's daily surplus or deficit.
// Macros: protein per pound of body weight (goal weight when given), fat a chosen
// share of calories, carbs the rest (4 cal/g protein and carbs, 9 cal/g fat).
import type { Macros } from './types';

export type Sex = 'male' | 'female';

export const GOALS = [
  { id: 'cutHard', label: 'Fast cut', delta: -500 },
  { id: 'cut', label: 'Slow cut', delta: -250 },
  { id: 'maintain', label: 'Maintain', delta: 0 },
  { id: 'bulk', label: 'Lean bulk', delta: 250 },
  { id: 'bulkHard', label: 'Bulk', delta: 500 },
] as const;

export type GoalId = (typeof GOALS)[number]['id'];

const STEP_TIERS: [number, string][] = [
  [0, 'Sedentary'],
  [5000, 'Lightly active'],
  [7500, 'Active'],
  [10000, 'Very active'],
  [15000, 'Athlete'],
];
export const stepTier = (steps: number) => STEP_TIERS.filter(([min]) => steps >= min).at(-1)![1];

/** Protein slider range, grams per pound. */
export const PROTEIN_PER_LB: [number, number] = [0.7, 1.2];
/** Fat slider range, share of calories. */
export const FAT_SHARE: [number, number] = [0.2, 0.45];

export interface Body {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  goalWeightKg?: number;
  bodyFatPct?: number;
  steps: number;
  trainingDays: number;
  goal: GoalId;
  proteinPerLb: number;
  fatShare: number;
}

/** Below this, eating plans need a doctor or dietitian, so we don't go lower. */
export const CALORIE_FLOOR: Record<Sex, number> = { male: 1500, female: 1200 };

const KG_PER_LB = 0.45359237;
export const lbToKg = (lb: number) => lb * KG_PER_LB;
export const kgToLb = (kg: number) => kg / KG_PER_LB;
export const inToCm = (inches: number) => inches * 2.54;

/** 1.2 sitting all day, +0.025 per 1,000 daily steps, +0.035 per training day; at most 2. */
export const activityFactor = (steps: number, trainingDays: number) =>
  Math.min(2, 1.2 + (steps / 1000) * 0.025 + trainingDays * 0.035);

export interface MacroResult {
  macros: Macros;
  /** Share of calories from each macro (adds up to 1). */
  shares: { protein: number; carbs: number; fat: number };
  /** True when the goal would go below CALORIE_FLOOR and was raised to it. */
  floored: boolean;
}

export function calculateMacros(b: Body): MacroResult {
  const bmr =
    b.bodyFatPct != null
      ? 370 + 21.6 * b.weightKg * (1 - b.bodyFatPct / 100)
      : 10 * b.weightKg + 6.25 * b.heightCm - 5 * b.age + (b.sex === 'male' ? 5 : -161);
  const delta = GOALS.find((g) => g.id === b.goal)!.delta;
  const wanted = bmr * activityFactor(b.steps, b.trainingDays) + delta;
  const calories = Math.round(Math.max(wanted, CALORIE_FLOOR[b.sex]));

  // Protein first, then fat; carbs get the rest. On very low calories fat shrinks
  // before carbs go negative.
  const protein = Math.round(Math.min(b.proteinPerLb * kgToLb(b.goalWeightKg ?? b.weightKg), calories / 4));
  const fat = Math.round(Math.min((calories * b.fatShare) / 9, (calories - 4 * protein) / 9));
  const carbs = Math.max(0, Math.round((calories - 4 * protein - 9 * fat) / 4));

  return {
    macros: { calories, protein, carbs, fat },
    shares: { protein: (4 * protein) / calories, carbs: (4 * carbs) / calories, fat: (9 * fat) / calories },
    floored: wanted < CALORIE_FLOOR[b.sex],
  };
}
