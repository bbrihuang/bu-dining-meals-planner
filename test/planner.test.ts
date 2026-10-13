// The planner and the macro calculator, against real BU days.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { calculateMacros, GOALS, inToCm, lbToKg } from '../src/lib/macros.ts';
import { planDay, sumMacros } from '../src/lib/planner.ts';
import { allowedServings, formatAmount } from '../src/lib/portions.ts';
import type { HallDay, Macros, MenuItem } from '../src/lib/types.ts';

const day = (name: string): HallDay => JSON.parse(readFileSync(new URL(`fixtures/${name}`, import.meta.url), 'utf8'));

const DAYS = {
  'Warren, weekday': day('warren-day.json'),
  'West, brunch day': day('west-brunch-day.json'),
  Fenway: day('fenway-day.json'),
};

const TARGETS: Record<string, Macros> = {
  maintain: { calories: 2400, protein: 160, carbs: 260, fat: 80 },
  cut: { calories: 1900, protein: 170, carbs: 170, fat: 60 },
  bulk: { calories: 3200, protein: 190, carbs: 380, fat: 100 },
  small: { calories: 1700, protein: 110, carbs: 190, fat: 55 },
};

describe.each(Object.entries(DAYS))('%s', (_, hallDay) => {
  it.each(Object.entries(TARGETS))('plans a %s day close to target', (_, daily) => {
    const meals = planDay({ day: hallDay, daily });
    expect(meals.length).toBeGreaterThanOrEqual(2);
    for (const meal of meals) expect(meal.plate, `${meal.period} has no plate`).not.toBeNull();

    const total = sumMacros(meals.flatMap((m) => m.plate!.items));
    expect(Math.abs(total.calories / daily.calories - 1)).toBeLessThan(0.1);
    expect(total.protein / daily.protein).toBeGreaterThan(0.85);

    // Only takeable amounts, and the same main never twice in a day.
    const items = meals.flatMap((m) => m.plate!.items);
    for (const { item, servings } of items) expect(allowedServings(item).some((s) => Math.abs(s - servings) < 1e-6)).toBe(true);
  });

  it('offers different options and honors exclusions', () => {
    const [first] = planDay({ day: hallDay, daily: TARGETS.maintain });
    expect(first.options.length).toBeGreaterThan(1);
    const excluded = new Set(first.plate!.items.map((p) => p.item.id));
    const [again] = planDay({ day: hallDay, daily: TARGETS.maintain, excluded });
    expect(again.plate!.items.some((p) => excluded.has(p.item.id))).toBe(false);
  });
});

describe('amounts', () => {
  const item = (serving: string): MenuItem => ({
    id: 'x',
    name: 'X',
    station: 'S',
    serving,
    calories: 100,
    protein: 10,
    carbs: 10,
    fat: 2,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    tags: [],
    allergens: [],
  });

  it.each([
    ['1/2 cup', 3, '1½ cups'],
    ['4 oz', 1.5, '6 oz'],
    ['2 link', 1.5, '3 links'],
    ['1/8 cut', 2, '2 slices'],
    ['1/2 sandwich', 2, '1 sandwich'],
    ['1 each', 2, '2×'],
    ['1 fl oz', 4, '½ cup'],
  ])('%s × %s = %s', (serving, servings, want) => {
    expect(formatAmount(item(serving), servings)).toBe(want);
  });
});

describe('macro calculator', () => {
  const body = {
    sex: 'male' as const,
    age: 20,
    heightCm: inToCm(70),
    weightKg: lbToKg(170),
    steps: 8000,
    trainingDays: 4,
    goal: 'maintain' as const,
    proteinPerLb: 1,
    fatShare: 0.3,
  };

  it('gives sensible numbers whose macros add up to the calories', () => {
    for (const goal of GOALS) {
      const { macros } = calculateMacros({ ...body, goal: goal.id });
      expect(macros.calories).toBeGreaterThan(1900);
      expect(macros.calories).toBeLessThan(3600);
      expect(macros.protein).toBe(170);
      expect(Math.abs(4 * macros.protein + 4 * macros.carbs + 9 * macros.fat - macros.calories)).toBeLessThan(10);
    }
  });

  it('never goes below the calorie floor', () => {
    const r = calculateMacros({ ...body, sex: 'female', weightKg: 45, heightCm: 150, steps: 0, trainingDays: 0, goal: 'cutHard' });
    expect(r.macros.calories).toBe(1200);
    expect(r.floored).toBe(true);
  });
});
