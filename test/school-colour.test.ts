// School colours: whatever colour a school brings, the fill stands out in dark mode and the text on it reads.
import { describe, expect, it } from 'vitest';
import { contrast, schoolScope } from '../src/components/ui.tsx';

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
const DARK_BG = rgb('#0f1114');

// BU scarlet, a deep navy, a bright gold, a forest green, a purple, and a pale colour.
const COLOURS = ['#cc0000', '#002855', '#ffc72c', '#154734', '#4e2a84', '#a3c1e0'];

describe('schoolScope', () => {
  it.each(COLOURS)('keeps text on %s at 4.5:1 or better in both modes', (colour) => {
    const s = schoolScope(colour).style as Record<string, string>;
    expect(contrast(rgb(s['--on-school-light']), rgb(s['--school-light']))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(rgb(s['--on-school-dark']), rgb(s['--school-dark']))).toBeGreaterThanOrEqual(4.5);
  });

  it.each(COLOURS)('makes %s stand out from the dark page (3:1)', (colour) => {
    const s = schoolScope(colour).style as Record<string, string>;
    expect(contrast(rgb(s['--school-dark']), DARK_BG)).toBeGreaterThanOrEqual(3);
  });

  it('leaves BU scarlet as it is, with white text, in both modes', () => {
    const s = schoolScope('#cc0000').style as Record<string, string>;
    expect(s['--school-dark']).toBe('#cc0000');
    expect(s['--on-school-light']).toBe('#ffffff');
    expect(s['--on-school-dark']).toBe('#ffffff');
  });
});
