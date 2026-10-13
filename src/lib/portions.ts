// Turns a label's serving size ("1/2 cup", "2 link", "1/8 cut", "4 oz") into amounts
// a person can actually take, and formats them for display:
//   countable things (eggs, links, slices, sandwiches) → whole pieces
//   scoopable things (cups, fl oz, tbsp)               → quarter cups, from ½ cup to 2 cups
//   weighed things (oz)                                → whole ounces, from 2 oz to 8 oz
// The planner can only choose from those amounts, so it never suggests "0.3× chicken".
import type { MenuItem } from './types';

export type PortionKind = 'count' | 'volume' | 'weight';

export interface Portion {
  kind: PortionKind;
  /** One label serving in the base unit: pieces, cups, or ounces. */
  base: number;
  /** Piece noun for countables ("link", "slice"); '' when it's just "2×". */
  noun: string;
  /** Allowed amounts in the base unit, ascending. */
  amounts: number[];
}

const COUNT_NOUNS: Record<string, string> = {
  each: '',
  serving: '',
  portion: '',
  entree: '',
  bowl: '',
  quesadilla: '',
  link: 'link',
  cookie: 'cookie',
  slice: 'slice',
  piece: 'piece',
  patty: 'patty',
  muffin: 'muffin',
  roll: 'roll',
  wedge: 'wedge',
  bagel: 'bagel',
  sandwich: 'sandwich',
  wrap: 'wrap',
  taco: 'taco',
  cut: 'slice', // "1/8 cut" is one slice of a pie or sheet
};

const CUPS: Record<string, number> = { cup: 1, 'fl oz': 1 / 8, tbsp: 1 / 16, tsp: 1 / 48 };
const OUNCES: Record<string, number> = { oz: 1, g: 1 / 28.35 };

/** "1/2", "0.25", "1 1/2", "3" → number. */
function amountOf(s: string): number | null {
  const mixed = s.match(/^(\d+) (\d+)\/(\d+)$/);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const frac = s.match(/^(\d+)\/(\d+)$/);
  if (frac) return Number(frac[1]) / Number(frac[2]);
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : null;
}

const steps = (from: number, to: number, step: number) => {
  const out: number[] = [];
  for (let v = from; v <= to + 1e-9; v += step) out.push(Math.round(v * 1000) / 1000);
  return out;
};

// The planner asks about the same few serving texts thousands of times per plan.
const cache = new Map<string, Portion>();

export function portionOf(serving: string): Portion {
  let p = cache.get(serving);
  if (!p) cache.set(serving, (p = read(serving)));
  return p;
}

function read(serving: string): Portion {
  const m = serving.match(/^([\d./ ]+?) ([a-z][a-z ]*)$/);
  const amount = m ? amountOf(m[1].trim()) : null;
  const unit = m?.[2] ?? '';

  if (amount != null && unit in CUPS) return { kind: 'volume', base: amount * CUPS[unit], noun: '', amounts: steps(0.5, 2, 0.25) };
  if (amount != null && unit in OUNCES) return { kind: 'weight', base: amount * OUNCES[unit], noun: '', amounts: steps(2, 8, 1) };
  if (amount != null && unit in COUNT_NOUNS) {
    const noun = COUNT_NOUNS[unit];
    // "1/8 cut" (a pizza slice) or "1/2 sandwich": one serving is one piece.
    if (unit === 'cut' || amount < 1) {
      return { kind: 'count', base: 1, noun: unit === 'sandwich' || unit === 'wrap' ? 'half' : noun, amounts: [1, 2, 3, 4] };
    }
    // "2 link", "3 each": any whole number of pieces.
    return { kind: 'count', base: amount, noun, amounts: steps(1, Math.max(3, Math.min(8, Math.round(amount * 2))), 1) };
  }
  // Unknown or blank: whole servings only.
  return { kind: 'count', base: 1, noun: '', amounts: [1, 2, 3] };
}

/** The numbers of label servings the planner may choose for an item. */
export const allowedServings = (item: MenuItem) => {
  const p = portionOf(item.serving);
  return p.amounts.map((a) => a / p.base);
};

const GLYPHS: Record<string, string> = { '0.25': '¼', '0.5': '½', '0.75': '¾' };

function pretty(n: number): string {
  const whole = Math.floor(n + 1e-9);
  const frac = Math.round((n - whole) * 4) / 4;
  if (frac === 0 || frac === 1) return String(Math.round(n));
  return `${whole || ''}${GLYPHS[String(frac)]}`;
}

const plural = (noun: string, n: number) => {
  if (n <= 1) return noun;
  if (noun === 'patty') return 'patties';
  if (/(ch|sh|s|x)$/.test(noun)) return `${noun}es`;
  return `${noun}s`;
};

/** How much to take, for people: "1½ cups", "4 oz", "3 links", "½ sandwich", "2×". */
export function formatAmount(item: MenuItem, servings: number): string {
  const p = portionOf(item.serving);
  const amt = Math.round(servings * p.base * 1000) / 1000;
  if (p.kind === 'volume') return amt < 0.5 ? `${Math.round(amt * 16)} tbsp` : `${pretty(amt)} ${amt > 1 ? 'cups' : 'cup'}`;
  if (p.kind === 'weight') return `${pretty(amt)} oz`;
  if (p.noun === 'half') return `${pretty(amt / 2)} ${/wrap/i.test(item.serving) ? 'wrap' : 'sandwich'}`;
  if (!p.noun) return `${pretty(amt)}×`;
  return `${pretty(amt)} ${plural(p.noun, amt)}`;
}

/** The label's serving, tidied for reading: "1 serving" for blanks. */
export const servingText = (item: MenuItem) => item.serving || '1 serving';
