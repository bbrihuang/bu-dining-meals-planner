// The warnings that stop bad menu data from passing as fact: odd labels and old menus.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { isPlannable, isSuspect } from '../src/lib/classify.ts';
import { MENUS_OLD_AFTER_MS, menusAreOld } from '../src/lib/data.ts';
import { dishesOf, planDay } from '../src/lib/planner.ts';
import type { HallDay, MenuItem } from '../src/lib/types.ts';

const dish = (over: Partial<MenuItem>): MenuItem => ({
  id: over.name ?? 'x',
  name: 'Dish',
  station: 'Grill',
  serving: '1 each',
  calories: 300,
  protein: 20,
  carbs: 25,
  fat: 12,
  fiber: 2,
  sugar: 2,
  sodium: 400,
  tags: [],
  allergens: [],
  ...over,
});

describe('odd labels', () => {
  it('flags a serving over 1,200 calories, even when its macros agree with it', () => {
    // A whole tub listed as one serving: internally consistent, still not a serving.
    const tub = dish({ name: 'Chive Cream Cheese', serving: '26 oz', calories: 1890, protein: 81, carbs: 32, fat: 156 });
    expect(isSuspect(tub)).toBe(true);
    expect(isPlannable(tub)).toBe(false);
  });

  it('flags impossible numbers', () => {
    expect(isSuspect(dish({ name: 'Kadai Jhinga Masala', serving: '1/2 cup', calories: 5665, protein: 903, carbs: 7, fat: 196 }))).toBe(true);
  });

  it('flags macros that do not add up to the calories', () => {
    // 4 g protein + 38 g carbs + 2 g fat is about 186 calories, not 425.
    expect(isSuspect(dish({ name: 'Waffle', calories: 425, protein: 4, carbs: 38, fat: 2 }))).toBe(true);
  });

  it('leaves an ordinary dish alone', () => {
    // 29 g protein + 8 g carbs + 19 g fat is 319 calories.
    const korma = dish({ name: 'Chicken Korma', serving: '5 oz', calories: 319, protein: 29, carbs: 8, fat: 19 });
    expect(isSuspect(korma)).toBe(false);
    expect(isPlannable(korma)).toBe(true);
  });

  it('does not call a big but consistent dish odd', () => {
    // 1,000 calories is a lot for one serving, but it is not a label mistake. The planner
    // still skips it (over 900), so no plate is built on it.
    const big = dish({ name: 'Loaded Nachos', calories: 1000, protein: 40, carbs: 90, fat: 52 });
    expect(isSuspect(big)).toBe(false);
    expect(isPlannable(big)).toBe(false);
  });

  it('checks the options of a Create Your Own station, not the station itself', () => {
    const station = dish({ name: 'Create Your Own Omelet Station', calories: 0, protein: 0, carbs: 0, fat: 0, options: [dish({ name: 'Cheese' })] });
    expect(isSuspect(station)).toBe(false);
  });
});

describe('on real BU menus', () => {
  const read = (name: string): HallDay => JSON.parse(readFileSync(new URL(`fixtures/${name}`, import.meta.url), 'utf8'));
  const DAYS: Record<string, HallDay> = {
    'Warren, weekday': read('warren-day.json'),
    'West, brunch day': read('west-brunch-day.json'),
    Fenway: read('fenway-day.json'),
  };

  it.each(Object.entries(DAYS))('%s: only a few dishes are flagged, and none lands on a plate', (_, day) => {
    const menu = Object.values(day).flatMap((m) => m?.items ?? []);
    const dishes = dishesOf(menu);
    const flagged = dishes.filter(isSuspect);
    // Warnings that fire on everything stop meaning anything.
    expect(flagged.length / dishes.length).toBeLessThan(0.03);

    const plates = planDay({ day, daily: { calories: 2200, protein: 150, carbs: 230, fat: 75 } });
    for (const meal of plates) for (const option of meal.options) for (const { item } of option.items) expect(isSuspect(item), item.name).toBe(false);
  });
});

describe('old menus', () => {
  const now = Date.parse('2026-10-18T12:00:00Z');
  const ago = (ms: number) => new Date(now - ms).toISOString();
  const HOUR = 60 * 60 * 1000;

  it('trusts menus refreshed within the last day and a half', () => {
    expect(menusAreOld(ago(10 * HOUR), now)).toBe(false);
    expect(menusAreOld(ago(MENUS_OLD_AFTER_MS), now)).toBe(false);
  });

  it('warns once a refresh has been missed', () => {
    expect(menusAreOld(ago(MENUS_OLD_AFTER_MS + 1), now)).toBe(true);
    expect(menusAreOld(ago(6 * 24 * HOUR), now)).toBe(true);
  });

  it('stays quiet when the date cannot be read', () => {
    expect(menusAreOld('not a date', now)).toBe(false);
    expect(menusAreOld('', now)).toBe(false);
  });
});
