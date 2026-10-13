// Helpers every menu reader shares: number parsing, ids, and turning each dining
// website's own words (serving sizes, allergens, diet labels) into the planner's.

/** First number in "24g", "1,200", "0+"; null if there is none. */
export function num(s: string | number | null | undefined): number | null {
  if (s == null) return null;
  if (typeof s === 'number') return Number.isFinite(s) ? s : null;
  const m = s.replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
}

export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[®™]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const ALLERGENS = ['Egg', 'Fish', 'Milk', 'Peanuts', 'Sesame', 'Shellfish', 'Soy', 'Tree Nuts', 'Wheat'];

const ALLERGEN_WORDS: [RegExp, string][] = [
  [/\beggs?\b/i, 'Egg'],
  [/\bfish\b/i, 'Fish'],
  [/\bmilk\b|\bdairy\b/i, 'Milk'],
  [/\bpeanuts?\b/i, 'Peanuts'],
  [/\bsesame\b/i, 'Sesame'],
  [/shellfish|crustacean/i, 'Shellfish'],
  [/\bsoy/i, 'Soy'],
  [/tree ?nuts?/i, 'Tree Nuts'],
  [/\bwheat\b|\bgluten\b/i, 'Wheat'],
];

/** A site's allergen words ("Eggs", "Soybeans", "Tree Nuts") → the names in ALLERGENS. */
export const allergensFrom = (words: string[]) =>
  ALLERGENS.filter((a) => ALLERGEN_WORDS.some(([re, name]) => name === a && words.some((w) => re.test(w))));

/** A site's diet labels → vegetarian, vegan, halal, gluten-free (vegan implies vegetarian). */
export function tagsFrom(words: string[]): string[] {
  const w = words.map((x) => x.toLowerCase());
  const tags = new Set<string>();
  if (w.some((x) => /vegan/.test(x))) tags.add('vegan').add('vegetarian');
  if (w.some((x) => /vegetarian/.test(x))) tags.add('vegetarian');
  if (w.some((x) => /halal/.test(x))) tags.add('halal');
  if (w.some((x) => /gluten[- ]?free/.test(x))) tags.add('gluten-free');
  return [...tags];
}

/**
 * Serving sizes come as "4 Ounce", "3 ozw", "1 Tablespoon", "2 Cups", "1 Spoodle 3 FLOZ".
 * Rewrites them as "<amount> <unit>" with one spelling per unit, which is what
 * src/lib/portions.ts reads.
 */
export function normalizeServing(raw: string): string {
  let s = raw.toLowerCase().replace(/\s+/g, ' ').trim();
  if (!s) return '1 serving';
  const spoodle = s.match(/spoodle (\d+(?:\.\d+)?) ?fl ?oz/);
  if (spoodle) return `${spoodle[1]} fl oz`;
  s = s.replace(/^(\d)-(\d+\/\d+)/, '$1 $2').replace(/^(\d+(?:\.\d+)?)(?=[a-z])/, '$1 ');
  const m = s.match(/^([\d./ ]+?)\s*([a-z][a-z .]*)$/);
  if (!m) return /^[a-z]/.test(s) ? `1 ${s}` : s;
  const unit = m[2]
    .trim()
    .replace(/\.$/, '')
    .replace(/^(fl\.? ?oz|floz|fluid ounces?)$/, 'fl oz')
    .replace(/^(oz|ozw|ounces?)$/, 'oz')
    .replace(/^(cups?|c)$/, 'cup')
    .replace(/^(tbsp|tablespoons?)$/, 'tbsp')
    .replace(/^(tsp|teaspoons?)$/, 'tsp')
    .replace(/^(ea|each)$/, 'each');
  return `${m[1].trim()} ${SINGULAR[unit] ?? unit}`;
}

const SINGULAR: Record<string, string> = {
  links: 'link',
  slices: 'slice',
  pieces: 'piece',
  cookies: 'cookie',
  muffins: 'muffin',
  rolls: 'roll',
  wedges: 'wedge',
  sandwiches: 'sandwich',
  patties: 'patty',
  servings: 'serving',
  portions: 'portion',
};
