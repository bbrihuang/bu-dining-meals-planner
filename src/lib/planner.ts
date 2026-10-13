// The meal planner. Pure functions, no network; plans a whole day in a few ms.
//
// For each meal it tries every sensible plate shape (protein + starch + side,
// entree + side, ...) built from that meal's real menu, and for each plate every
// combination of takeable portions (see portions.ts). It keeps the plates that land
// closest to the meal's target and returns up to 3 genuinely different ones.
//
// Meals are planned in order, and each one aims at what's left of the day after the
// meals before it: if breakfast runs a little over, dinner comes in a little lighter.
import { BREAKFAST_ONLY, isMain, isPlannable, isVegetable, ONE_PER_PLATE, rolesOf, type Role } from './classify';
import { allowedServings, portionOf } from './portions';
import { PERIODS, type HallDay, type Macros, type MenuItem, type Period, type Plate, type PlateItem } from './types';

/** Each meal's usual share of the day, rescaled over the meals a hall serves. */
const MEAL_WEIGHTS: Record<Period, number> = { breakfast: 0.25, brunch: 0.35, lunch: 0.35, dinner: 0.4 };

export const ZERO: Macros = { calories: 0, protein: 0, carbs: 0, fat: 0 };

export const addMacros = (a: Macros, b: Macros): Macros => ({
  calories: a.calories + b.calories,
  protein: a.protein + b.protein,
  carbs: a.carbs + b.carbs,
  fat: a.fat + b.fat,
});

export const sumMacros = (items: PlateItem[]): Macros =>
  items.reduce(
    (acc, { item, servings }) =>
      addMacros(acc, {
        calories: item.calories * servings,
        protein: item.protein * servings,
        carbs: item.carbs * servings,
        fat: item.fat * servings,
      }),
    ZERO
  );

/** How far a total is from a target; 0 is perfect. Relative, so it works at any size. */
function macroError(m: Macros, t: Macros): number {
  const rel = (a: number, b: number, floor: number) => (a - b) / Math.max(b, floor);
  return (
    3 * rel(m.calories, t.calories, 150) ** 2 +
    2 * rel(m.protein, t.protein, 10) ** 2 +
    rel(m.carbs, t.carbs, 15) ** 2 +
    rel(m.fat, t.fat, 8) ** 2
  );
}

/** Small penalties that keep plates looking like something a person would eat. */
function realismPenalty(items: PlateItem[]): number {
  let pen = 0;
  for (const { item, servings } of items) {
    const p = portionOf(item.serving);
    if (p.kind === 'volume') {
      const cups = servings * p.base;
      if (cups > 1.5) pen += ((cups - 1.5) / 0.25) * 0.01;
    } else if (p.kind === 'weight') {
      const oz = servings * p.base;
      if (oz > 6) pen += (oz - 6) * 0.015;
    } else if (servings > 2) {
      pen += (servings - 2) * 0.012;
    }
    // Two of a big item (burgers, a full plate) is a lot; prefer one.
    if (item.calories >= 300 && servings > 1) pen += (servings - 1) * 0.015;
    // A "Create Your Own" ingredient is fine, but a finished dish reads better.
    if (item.from) pen += 0.01;
  }
  return pen + Math.max(0, items.length - 2) * 0.006;
}

const SHAPES: Role[][] = [
  ['protein', 'starch', 'side'],
  ['protein', 'starch'],
  ['protein', 'protein', 'starch'],
  ['protein', 'side'],
  ['entree'],
  ['entree', 'side'],
  ['entree', 'protein'],
  ['entree', 'starch'],
  // For when nothing protein-heavy is left (everything excluded); these score worse.
  ['starch', 'side'],
  ['starch'],
];

const VEG_BONUS = 0.03;
const REPEAT_PENALTY = 0.3;

/** Caps how many of an item one plate holds (nobody takes 3 burgers). */
function servingsFor(item: MenuItem): number[] {
  const portion = portionOf(item.serving);
  let cap = Infinity;
  if (ONE_PER_PLATE.test(item.name)) cap = portion.noun === 'half' ? 2 : 1;
  else if (item.calories >= 350 || (portion.kind === 'count' && !portion.noun)) cap = 2;
  if (item.from) cap = Math.min(cap, 2);
  if (/pizza/i.test(item.name)) cap = Math.min(cap, 2 / portion.base);
  // A bowl of soup is about a cup and a half.
  if (/\b(soup|chowder|bisque)\b/i.test(item.name) && portion.kind === 'volume') cap = 1.5 / portion.base;
  return allowedServings(item).filter((s) => s <= cap + 1e-9);
}

interface Candidate {
  item: MenuItem;
  roles: Role[];
  servings: number[];
}

/** The most useful few items per role, so the search stays fast. */
function shortlist(cands: Candidate[], role: Role, target: Macros, n: number): Candidate[] {
  const score = ({ item }: Candidate) => {
    const kcal = Math.max(item.calories, 1);
    if (role === 'protein' || role === 'entree') return item.protein / kcal - (role === 'entree' && target.carbs < 25 ? 1 : 0);
    if (role === 'starch') return item.carbs / kcal - (item.fat / kcal) * 0.5;
    return item.fiber / kcal + 0.01;
  };
  return cands
    .filter((c) => c.roles.includes(role))
    .sort((a, b) => score(b) - score(a))
    .slice(0, n);
}

function* combos<T>(lists: T[][]): Generator<T[]> {
  if (!lists.length) {
    yield [];
    return;
  }
  const [first, ...rest] = lists;
  for (const x of first) for (const tail of combos(rest)) yield [x, ...tail];
}

/** Above this many portion combinations, search step by step instead of trying them all. */
const EXHAUSTIVE_LIMIT = 150;

/** Best portions for a fixed set of items. */
function bestPortions(set: Candidate[], target: Macros): { plate: PlateItem[]; err: number } | null {
  const score = (idx: number[]) => {
    const plate = set.map((c, i) => ({ item: c.item, servings: c.servings[idx[i]] }));
    return { plate, err: macroError(sumMacros(plate), target) + realismPenalty(plate) };
  };
  const total = set.reduce((n, c) => n * c.servings.length, 1);
  if (!total) return null;

  let best: { plate: PlateItem[]; err: number } | null = null;
  if (total <= EXHAUSTIVE_LIMIT) {
    // Count through every combination like an odometer.
    const idx = set.map(() => 0);
    for (let n = 0; n < total; n++) {
      const s = score(idx);
      if (!best || s.err < best.err) best = s;
      for (let i = 0; i < idx.length && ++idx[i] === set[i].servings.length; i++) idx[i] = 0;
    }
    return best;
  }

  // Many combinations (dishes listed by the ounce): change one amount at a time while
  // that helps, from the smallest, middle and largest amounts.
  const starts = [set.map(() => 0), set.map((c) => Math.floor((c.servings.length - 1) / 2)), set.map((c) => c.servings.length - 1)];
  for (const start of starts) {
    const idx = [...start];
    let cur = score(idx);
    for (let improved = true; improved; ) {
      improved = false;
      for (let i = 0; i < set.length; i++) {
        for (let j = 0; j < set[i].servings.length; j++) {
          if (j === idx[i]) continue;
          const trial = [...idx];
          trial[i] = j;
          const s = score(trial);
          if (s.err < cur.err - 1e-9) {
            cur = s;
            idx[i] = j;
            improved = true;
          }
        }
      }
    }
    if (!best || cur.err < best.err) best = cur;
  }
  return best;
}

/**
 * Every dish a plate can be built from. A "Create Your Own" station counts as its
 * options (the omelet bar's eggs and ham), minus any already on the menu by name.
 */
export function dishesOf(menu: MenuItem[]): MenuItem[] {
  const seen = new Set<string>();
  const out: MenuItem[] = [];
  for (const item of [...menu.filter((i) => !i.options), ...menu.flatMap((i) => i.options ?? [])]) {
    const key = item.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export interface PlanMealArgs {
  menu: MenuItem[];
  target: Macros;
  period: Period;
  /** Item ids the person doesn't want. */
  excluded?: Set<string>;
  /** Mains (lowercase names) already planned earlier today, so they aren't repeated. */
  eatenMains?: Set<string>;
  maxOptions?: number;
}

/** Up to `maxOptions` different plates for one meal, best first. */
export function planMeal({ menu, target, period, excluded, eatenMains, maxOptions = 3 }: PlanMealArgs): Plate[] {
  const breakfasty = period === 'breakfast' || period === 'brunch';
  const cands: Candidate[] = dishesOf(menu)
    .filter((it) => isPlannable(it) && !excluded?.has(it.id) && (breakfasty || !BREAKFAST_ONLY.test(it.name)))
    .map((item) => ({ item, roles: rolesOf(item), servings: servingsFor(item) }));

  const lists: Record<Role, Candidate[]> = {
    protein: shortlist(cands, 'protein', target, 9),
    entree: shortlist(cands, 'entree', target, 7),
    starch: shortlist(cands, 'starch', target, 7),
    side: shortlist(cands, 'side', target, 5),
  };

  const scored: { plate: PlateItem[]; err: number }[] = [];
  const seen = new Set<string>();
  for (const shape of SHAPES) {
    for (const set of combos(shape.map((r) => lists[r]))) {
      const ids = set.map((c) => c.item.id);
      if (new Set(ids).size !== ids.length) continue;
      const key = [...ids].sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      // Two separate proteins on one plate (eggs + sausage) only at breakfast.
      if (shape[0] === 'protein' && shape[1] === 'protein' && !breakfasty) continue;
      // Never two whole-meal items (a burger and a sandwich).
      if (set.filter((c) => ONE_PER_PLATE.test(c.item.name)).length > 1) continue;

      const best = bestPortions(set, target);
      if (!best) continue;
      const veg = !breakfasty && set.some((c, i) => shape[i] === 'side' && isVegetable(c.item)) ? VEG_BONUS : 0;
      const repeat = set.some((c) => eatenMains?.has(c.item.name.toLowerCase()) && isMain(c.item)) ? REPEAT_PENALTY : 0;
      scored.push({ plate: best.plate, err: best.err - veg + repeat });
    }
  }
  scored.sort((a, b) => a.err - b.err);

  // Options must be actually different: each has a different main, shares at most one
  // item with any option already picked, and is still a decent fit.
  const anchor = (p: PlateItem[]) => [...p].sort((a, b) => b.item.protein * b.servings - a.item.protein * a.servings)[0]?.item.id;
  const cutoff = scored.length ? Math.max(scored[0].err * 2.5, scored[0].err + 0.06) : 0;
  const picked: PlateItem[][] = [];
  for (const s of scored) {
    if (picked.length >= maxOptions || s.err > cutoff) break;
    const a = anchor(s.plate);
    const distinct = picked.every(
      (p) => anchor(p) !== a && p.filter((x) => s.plate.some((y) => y.item.id === x.item.id)).length <= 1
    );
    if (distinct) picked.push(s.plate);
  }
  return picked.map((items) => ({ items, macros: sumMacros(items) }));
}

/**
 * Target for the next meal: its share of whatever's left of the day after the meals
 * already planned, kept within 50–160% of its usual share so one big breakfast can't
 * make dinner vanish.
 */
function nextTarget(daily: Macros, eaten: Macros, sharesLeft: number, share: number): Macros {
  const k = share / sharesLeft;
  const clamp = (key: keyof Macros) => {
    const base = daily[key] * share;
    return Math.min(base * 1.6, Math.max(base * 0.5, (daily[key] - eaten[key]) * k));
  };
  return { calories: clamp('calories'), protein: clamp('protein'), carbs: clamp('carbs'), fat: clamp('fat') };
}

export interface PlannedMeal {
  period: Period;
  target: Macros;
  options: Plate[];
  /** Which option is showing; options[choice] is the plate. */
  choice: number;
  plate: Plate | null;
}

export interface PlanDayArgs {
  day: HallDay;
  daily: Macros;
  /** Which option the person is looking at for each meal. */
  choices?: Partial<Record<Period, number>>;
  excluded?: Set<string>;
}

/** Plans every meal the hall serves that day, in order, each balancing the ones before. */
export function planDay({ day, daily, choices = {}, excluded }: PlanDayArgs): PlannedMeal[] {
  const periods = PERIODS.filter((p) => day[p]?.items.length);
  const total = periods.reduce((s, p) => s + MEAL_WEIGHTS[p], 0);
  const shares = periods.map((p) => MEAL_WEIGHTS[p] / total);
  let eaten = ZERO;
  const eatenMains = new Set<string>();

  return periods.map((period, i) => {
    const sharesLeft = shares.slice(i).reduce((a, b) => a + b, 0);
    const target = nextTarget(daily, eaten, sharesLeft, shares[i]);
    const options = planMeal({ menu: day[period]!.items, target, period, excluded, eatenMains });
    const choice = Math.min(choices[period] ?? 0, Math.max(options.length - 1, 0));
    const plate = options[choice] ?? null;
    if (plate) {
      for (const { item } of plate.items) if (isMain(item)) eatenMains.add(item.name.toLowerCase());
      eaten = addMacros(eaten, plate.macros);
    }
    return { period, target, options, choice, plate };
  });
}
