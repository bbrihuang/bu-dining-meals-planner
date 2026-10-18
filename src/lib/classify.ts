// Decides which menu items can go on a planned plate, and what role each one plays.
// Menus list everything served, including sauces, drinks, desserts and toppings.
// Those are real, but they shouldn't be the backbone of a macro plan.
import type { MenuItem } from './types';

export type Role = 'protein' | 'entree' | 'starch' | 'side';

const NOT_A_DISH =
  /\b(sauce|dressing|vinaigrette|oil|spice|seasoning|salsa|pico|crema|cilantro|pickle|pickled|harissa|tahini|tzatziki|compote|syrup|gravy|za'?atar|crouton|topping|lettuce|diced|sliced|shredded|crumbles|condiment|mayo|aioli|ketchup|mustard|jam|jelly|butter$|cream cheese|create your own|grill works|whipped|glaze|relish|chutney|raisins|craisins|dried (cranberries|fruit|apricots))\b/i;

const DRINK =
  /\b(fresca|juice|lemonade|coffee|tea|latte|soda|milk$|smoothie|infused water|punch|cider|mocha|cappuccino|espresso|chai|hot chocolate|beverage|drink|shake|milkshake)\b/i;

const DESSERT =
  /\b(cookie|brownie|blondie|cake|cupcake|cobbler|crisp|pudding|pie|donut|doughnut|churro|danish|pastry|scone|gelato|ice cream|sundae|tart|macaron|fudge|cinnamon roll|sweet roll|cheesecake|crumb|bars?$|dessert|monkey bread|banana bread|pumpkin bread|zucchini bread)\b/i;

/** Snacks: fine to eat, but not what a plate's carbs should come from. */
const SNACK = /\b(chips|crackers|pretzels?|popcorn)\b/i;

const VEG =
  /\b(broccoli|green beans?|spinach|kale|asparagus|carrots?|zucchini|squash|cauliflower|brussels|cabbage|salad|vegetables?|veggies?|greens|peas|corn|edamame|tomato(es)?|cucumbers?|peppers|mushrooms?|eggplant|fruit|apples?|banana|berries|melon|oranges?|grapes)\b/i;

/** Whole-meal items you'd take one of: a burger, a sandwich, a bowl. */
export const ONE_PER_PLATE =
  /(burger|\bsandwich|\bsub\b|panini|\bwrap\b|\bbowl\b|bagel|\bsalad\b|\bpita\b|quesadilla|burrito|lasagna|calzone|stromboli|\bmelt\b)/i;

/** Yogurt, oatmeal and cereal are breakfast foods (at lunch the yogurt is a topping). */
export const BREAKFAST_ONLY = /\b(yogurt|oatmeal|oats|cereal|granola|pancakes?|waffles?|french toast)\b/i;

/** A vegetable (or fruit) side that makes a plate look like a real meal. */
export const isVegetable = (item: MenuItem) => VEG.test(item.name);

/** Labels whose macros don't add up to their calories are data-entry mistakes. */
function macrosDisagree(item: MenuItem): boolean {
  const est = 4 * item.protein + 4 * item.carbs + 9 * item.fat;
  return Math.abs(est - item.calories) > Math.max(60, 0.35 * item.calories);
}

export function isPlannable(item: MenuItem): boolean {
  if (item.options) return false;
  if ([NOT_A_DISH, DRINK, DESSERT, SNACK].some((re) => re.test(item.name))) return false;
  if (/bakery|bliss|pastry|dessert/i.test(item.station) && !/\b(bagel|toast|oat|english muffin)\b/i.test(item.name)) return false;
  if (item.calories < 40 || item.calories > 900) return false;
  return !macrosDisagree(item);
}

/** One listed serving above this is a label mistake (a whole tray, a misplaced decimal). */
export const SUSPECT_CALORIES = 1200;

/**
 * Numbers too odd to take at face value: the Full menu warns about these. Menu data
 * comes straight from the dining hall, so a mistake there would otherwise read as fact.
 * (The planner already skips them: see isPlannable.)
 */
export function isSuspect(item: MenuItem): boolean {
  if (item.options) return false; // a "Create Your Own" station lists zeros; its options are checked on their own
  return item.calories > SUSPECT_CALORIES || (item.calories >= 40 && macrosDisagree(item));
}

/** Roles an item can fill. Most fill one; a few (a chicken sandwich) fill more. */
export function rolesOf(item: MenuItem): Role[] {
  const kcal = Math.max(item.calories, 1);
  const proteinShare = (4 * item.protein) / kcal;
  const carbShare = (4 * item.carbs) / kcal;
  const roles: Role[] = [];

  if (item.protein >= 12 && item.carbs >= 15 && item.calories >= 250) roles.push('entree');
  else if (proteinShare >= 0.3 && item.protein >= 6) roles.push('protein');

  if (!roles.includes('entree') && carbShare >= 0.45 && item.carbs >= 12) roles.push('starch');

  if (!roles.length && (isVegetable(item) || (item.fiber >= 2 && item.calories <= 180))) roles.push('side');

  // A burger or sandwich is a main even when its macros look like a side.
  if (ONE_PER_PLATE.test(item.name) && !roles.includes('entree') && !roles.includes('protein')) return ['entree'];

  // Any other real dish that's light (soups, mixed sides) can still be a side.
  if (!roles.length && item.calories <= 250) roles.push('side');
  return roles;
}

/** A plate's main: anything there for its protein (not the rice or the broccoli). */
export const isMain = (item: MenuItem) => rolesOf(item).some((r) => r === 'protein' || r === 'entree');
