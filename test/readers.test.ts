// The menu readers, each on a saved copy of the real site.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseBuPage } from '../scripts/providers/bu.ts';
import { normalizeServing } from '../scripts/providers/common.ts';
import { parseSodexoDay } from '../scripts/providers/sodexo.ts';
import { dishesOf } from '../src/lib/planner.ts';
import type { HallDay, MenuItem } from '../src/lib/types.ts';

const fixture = (name: string) => readFileSync(new URL(`fixtures/${name}`, import.meta.url), 'utf8');

const itemsOf = (day: HallDay) => Object.values(day).flatMap((meal) => meal.items);

function expectWellFormed(items: MenuItem[]) {
  for (const i of items) {
    expect(i.name).toBeTruthy();
    expect(i.station).toBeTruthy();
    if (i.options) continue;
    expect(i.serving).toMatch(/^[\d./ ]+ [a-z]/);
    for (const k of ['calories', 'protein', 'carbs', 'fat'] as const) expect(i[k]).toBeGreaterThanOrEqual(0);
  }
}

describe('BU Dining reader', () => {
  const day = parseBuPage(fixture('warren-2026-10-06.html'))['2026-10-06'];

  it('reads dishes with nutrition and hours', () => {
    expect(day).toBeDefined();
    const items = itemsOf(day);
    expect(items.length).toBeGreaterThanOrEqual(12); // the saved page is trimmed to a dozen dishes
    expectWellFormed(items);
    expect(Object.values(day).every((meal) => meal.hours)).toBe(true);
  });

  it('lists each dish once per meal', () => {
    for (const meal of Object.values(day)) {
      const names = meal.items.filter((i) => !i.options).map((i) => i.name.toLowerCase());
      expect(new Set(names).size).toBe(names.length);
    }
  });

  it('reads "Create Your Own" stations as a list of options', () => {
    const dinner = parseBuPage(fixture('warren-cyo-2026-10-11.html'))['2026-10-11'].dinner!.items;
    const stations = dinner.filter((i) => i.options);
    expect(stations).toHaveLength(3);
    expect(dinner.filter((i) => !i.options)).toHaveLength(2);

    const stirFry = stations.find((i) => i.name === 'Create Your Own Stir Fry Station')!;
    // The station itself has no nutrition; its options do.
    expect(stirFry.calories).toBe(0);
    const chicken = stirFry.options!.find((o) => o.name === 'Lemon Grilled Chicken Breast')!;
    expect(chicken).toMatchObject({ calories: 145, protein: 26, from: stirFry.name, station: 'Mongolian' });
    expect(stirFry.options!.find((o) => o.name === 'Tofu')!.allergens).toEqual(['Soy']);

    // The planner builds plates from the options, never the station.
    const dishes = dishesOf(dinner);
    expect(dishes.some((d) => d.options)).toBe(false);
    expect(dishes.some((d) => d.id === chicken.id)).toBe(true);
  });
});

describe('Sodexo reader (Fenway)', () => {
  const day = parseSodexoDay(JSON.parse(fixture('fenway-2026-10-08.json')));

  it('reads breakfast, lunch and dinner', () => {
    expect(Object.keys(day)).toEqual(['breakfast', 'lunch', 'dinner']);
    expectWellFormed(itemsOf(day));
  });
});

describe('serving sizes', () => {
  it.each([
    ['Serving size 4 Ounce', '4 oz'],
    ['3 ozw', '3 oz'],
    ['1 Tablespoon', '1 tbsp'],
    ['2 Cups', '2 cup'],
    ['1/2 cup', '1/2 cup'],
    ['1-1/2 slice', '1 1/2 slice'],
    ['1 Spoodle 3 FLOZ', '3 fl oz'],
    ['8 fl oz', '8 fl oz'],
    ['2 Links', '2 link'],
    ['1 each', '1 each'],
    ['', '1 serving'],
  ])('%s → %s', (raw, want) => {
    expect(normalizeServing(raw.replace(/^serving size /i, ''))).toBe(want);
  });
});
