// The daily-targets boxes: which numbers are accepted, and what the page says about the rest.
import { describe, expect, it } from 'vitest';
import { DEFAULT_TARGETS, targetProblems, validTarget } from '../src/lib/targets.ts';

const draft = (over: Partial<Record<keyof typeof DEFAULT_TARGETS, string>> = {}) => ({
  calories: '2200',
  protein: '150',
  carbs: '230',
  fat: '75',
  ...over,
});

describe('validTarget', () => {
  it('accepts numbers inside the limits, edges included', () => {
    expect(validTarget('calories', '1000')).toBe(true);
    expect(validTarget('calories', '6000')).toBe(true);
    expect(validTarget('carbs', '0')).toBe(true);
    expect(validTarget('protein', '20')).toBe(true);
  });

  it('rejects numbers outside the limits, blanks and non-numbers', () => {
    expect(validTarget('calories', '999')).toBe(false);
    expect(validTarget('calories', '6001')).toBe(false);
    expect(validTarget('protein', '19')).toBe(false);
    expect(validTarget('fat', '9')).toBe(false);
    expect(validTarget('fat', '')).toBe(false);
    expect(validTarget('fat', '  ')).toBe(false);
    expect(validTarget('fat', 'abc')).toBe(false);
  });
});

describe('targetProblems', () => {
  it('says nothing when every box is fine', () => {
    expect(targetProblems(draft())).toEqual([]);
  });

  it('names the box and the range that works', () => {
    expect(targetProblems(draft({ protein: '5' }))).toEqual(['Protein must be 20–400 g.']);
    expect(targetProblems(draft({ calories: '50' }))).toEqual(['Calories must be 1,000–6,000 cal.']);
  });

  it('asks for a number when a box is empty', () => {
    expect(targetProblems(draft({ fat: '' }))).toEqual(['Fat: enter a number, 10–300 g.']);
  });

  it('lists every problem, in the order the boxes appear on the page', () => {
    expect(targetProblems(draft({ fat: '', calories: '1', carbs: '9999' }))).toEqual([
      'Calories must be 1,000–6,000 cal.',
      'Carbs must be 0–900 g.',
      'Fat: enter a number, 10–300 g.',
    ]);
  });
});
