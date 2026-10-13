// Reader for BU Dining's own pages (https://www.bu.edu/dining/location/<hall>/).
//
// Each page server-renders about two weeks of menus (20+ MB of HTML): one
// `ol.js-menu-bydate[data-menudate]` per day, one `li.js-meal-period-<meal>` per meal
// with its hours, and one `li.menu-item` per dish carrying its full nutrition label.
// A "Create Your Own" station has no label of its own; it lists its ingredients,
// each with a label.
import * as cheerio from 'cheerio';
import { PERIODS, type HallDay, type MenuItem, type Period } from '../../src/lib/types.ts';
import { allergensFrom, normalizeServing, num, slug, tagsFrom } from './common.ts';
import type { HallMenus } from './index.ts';

type $Node = cheerio.Cheerio<any>;

const text = ($el: $Node) => $el.first().text().replace(/\s+/g, ' ').trim();

/** The dish's description, unless it only repeats the name. */
function describe($el: $Node, name: string) {
  const d = text($el.find('.menu-description'));
  return d && d.toLowerCase() !== name.toLowerCase() ? { description: d } : {};
}

/** Diet labels in a `.menu-item-dietary-restriction` list. */
const dietTags = ($: cheerio.CheerioAPI, $list: $Node) =>
  tagsFrom($list.find('li').map((_, li) => $(li).text()).get());

/** A dish (or one "Create Your Own" option) read from the nutrition label inside `$el`; null without one. */
function labelled($: cheerio.CheerioAPI, $el: $Node, name: string, station: string): MenuItem | null {
  if (!name) return null;
  const label: Record<string, string> = {};
  $el.find('.nutrition-label tr').each((_, tr) => {
    const k = text($(tr).find('.nutrition-label-nutrient'));
    const v = text($(tr).find('.nutrition-label-amount'));
    if (k && v) label[k] = v;
  });
  const calories = num(label['Calories']);
  const protein = num(label['Protein']);
  const carbs = num(label['Total Carbohydrate']);
  const fat = num(label['Total Fat']);
  // Without these four the planner can't use the dish.
  if (calories == null || protein == null || carbs == null || fat == null) return null;

  return {
    id: `${slug(name)}--${slug(station)}`,
    name,
    station,
    ...describe($el, name),
    serving: normalizeServing(text($el.find('.nutrition-serving-size')).replace(/^serving size/i, '')),
    calories,
    protein,
    carbs,
    fat,
    fiber: num(label['Dietary Fiber']) ?? 0,
    sugar: num(label['Sugars']) ?? 0,
    sodium: num(label['Sodium']) ?? 0,
    tags: dietTags($, $el.find('.menu-item-dietary-restriction').first()),
    allergens: allergensFrom($el.find('.nutrition-facts-allergens li').map((_, li) => $(li).text()).get()),
  };
}

/** One meal: its dishes, with "Create Your Own" stations holding their options. */
function readMeal($: cheerio.CheerioAPI, $meal: $Node): MenuItem[] {
  const items: MenuItem[] = [];
  const dishes = new Set<string>();

  $meal.find('li.menu-item').each((_, li) => {
    const $li = $(li);
    const name = text($li.find('.menu-item-title'));
    if (!name) return;
    const station = text($li.find('.js-sortby-station')) || 'Other';
    const id = `${slug(name)}--${slug(station)}`;

    // The options' labels sit inside the station's own element, so a station's
    // numbers must never be read from `$li.find('.nutrition-label')`.
    const $options = $li.find('li.nutrition-label-cyo-section');
    if ($options.length) {
      // The salad bar can list "Create Your Own" twice (greens, then toppings): one station.
      let cyo = items.find((i) => i.id === id && i.options);
      if (!cyo) {
        cyo = {
          id,
          name,
          station,
          ...describe($li, name),
          serving: '',
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
          tags: dietTags($, $li.find('.menu-station .menu-item-dietary-restriction').first()),
          allergens: [],
          options: [],
        };
        items.push(cyo);
      }
      const options = cyo.options!;
      $options.each((_, row) => {
        const $row = $(row);
        const optionName = text($row.find('.js-nutrition-cyo-open'));
        const option = labelled($, $row, optionName, station);
        if (!option || options.some((o) => o.name.toLowerCase() === option.name.toLowerCase())) return;
        options.push({ ...option, id: `${id}--${slug(optionName)}`, from: name });
      });
      return;
    }

    // The same dish is sometimes listed at two stations; keep the first.
    if (dishes.has(name.toLowerCase())) return;
    const item = labelled($, $li, name, station);
    if (!item) return;
    dishes.add(name.toLowerCase());
    items.push(item);
  });

  return items.filter((i) => !i.options || i.options.length);
}

export function parseBuPage(html: string): HallMenus {
  const $ = cheerio.load(html);
  const out: HallMenus = {};

  $('.js-menu-bydate[data-menudate]').each((_, dayEl) => {
    const date = $(dayEl).attr('data-menudate');
    if (!date) return;
    const day: HallDay = {};
    $(dayEl)
      .children('.menu-meal-period')
      .each((_, mealEl) => {
        const $meal = $(mealEl);
        const period = ($meal.attr('class') ?? '').match(/js-meal-period-(\w+)/)?.[1] as Period | undefined;
        if (!period || !PERIODS.includes(period)) return;
        const items = readMeal($, $meal);
        if (!items.length) return;
        const hours = text($meal.find('.js-meal-period-times')).replace(/\s*-\s*/, ' – ');
        day[period] = { ...(hours ? { hours } : {}), items };
      });
    if (Object.keys(day).length) out[date] = day;
  });

  return out;
}
