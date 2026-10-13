// Reader for halls run by Sodexo ("<school>.sodexomyway.com"), like BU's Fenway.
// Those pages load menus in the browser from Sodexo's menu service, one day per
// request, so this asks the service directly. A hall's `feed` is
// "<locationId>/<menuId>"; both appear in the hall page's HTML.
import type { DiningHall } from '../../src/data/schools.ts';
import type { HallDay, MenuItem, Period } from '../../src/lib/types.ts';
import { allergensFrom, normalizeServing, num, slug, tagsFrom } from './common.ts';
import type { FetchText, HallMenus } from './index.ts';

const API = 'https://api-prd.sodexomyway.net/v0.2/data/menu';
// The public key Sodexo's own site sends from every visitor's browser.
const API_KEY = '68717828-b754-420d-9488-4c37cb7d7ef7';
const DAYS = 14;

interface SodexoItem {
  formalName?: string;
  description?: string;
  course?: string;
  portion?: string;
  calories?: string;
  protein?: string;
  carbohydrates?: string;
  fat?: string;
  dietaryFiber?: string;
  sugar?: string;
  sodium?: string;
  isVegan?: boolean;
  isVegetarian?: boolean;
  allergens?: { name?: string; contains?: string }[];
}

export interface SodexoMeal {
  name?: string;
  groups?: { name?: string; items?: SodexoItem[] }[];
}

/**
 * Sodexo writes portions like "EA", "3 OZ", "SLC=1/8", "#8 SCOOP". Turn the odd ones
 * into ordinary amounts before the shared clean-up.
 */
function portion(raw: string): string {
  const s = raw.trim().toLowerCase();
  const scoop = s.match(/^#(\d+) scoop$/); // a #N scoop holds 4/N cups
  if (scoop) return `${Math.round((4 / Number(scoop[1])) * 1000) / 1000} cup`;
  const pie = s.match(/^slc=(\d+\/\d+)$/); // one slice of a pie cut N ways
  if (pie) return `${pie[1]} cut`;
  if (/^slc\b/.test(s)) return '1 slice';
  return normalizeServing(s.replace(/\bea\b/, 'each').replace(/^([a-z])/, '1 $1'));
}

/** One day as Sodexo's service returns it. */
export function parseSodexoDay(meals: SodexoMeal[]): HallDay {
  const day: HallDay = {};
  for (const meal of meals) {
    const period = (meal.name ?? '').trim().toLowerCase() as Period;
    if (!['breakfast', 'brunch', 'lunch', 'dinner'].includes(period)) continue;
    const items: MenuItem[] = [];
    const names = new Set<string>();
    for (const group of meal.groups ?? []) {
      for (const it of group.items ?? []) {
        const name = (it.formalName ?? '').replace(/\s+/g, ' ').trim();
        const calories = num(it.calories);
        const protein = num(it.protein);
        const carbs = num(it.carbohydrates);
        const fat = num(it.fat);
        if (!name || calories == null || protein == null || carbs == null || fat == null) continue;
        if (names.has(name.toLowerCase())) continue; // same dish at two stations
        names.add(name.toLowerCase());

        const station = (it.course || group.name || 'Other').trim();
        const description = (it.description ?? '').trim();
        items.push({
          id: `${slug(name)}--${slug(station)}`,
          name,
          station,
          ...(description && description.toLowerCase() !== name.toLowerCase() ? { description } : {}),
          serving: portion(it.portion ?? ''),
          calories,
          protein,
          carbs,
          fat,
          fiber: num(it.dietaryFiber) ?? 0,
          sugar: num(it.sugar) ?? 0,
          sodium: num(it.sodium) ?? 0,
          tags: tagsFrom([it.isVegan ? 'vegan' : '', it.isVegetarian ? 'vegetarian' : '']),
          allergens: allergensFrom((it.allergens ?? []).filter((a) => a.contains === 'true').map((a) => a.name ?? '')),
        });
      }
    }
    if (items.length) day[period] = { items };
  }
  return day;
}

export async function readSodexoHall(hall: DiningHall, fetchText: FetchText, timeZone: string): Promise<HallMenus> {
  const [locationId, menuId] = (hall.feed ?? '').split('/');
  if (!locationId || !menuId) throw new Error(`${hall.name} needs feed "<locationId>/<menuId>" in schools.ts`);
  const dates = Array.from({ length: DAYS }, (_, i) =>
    new Date(Date.now() + i * 86_400_000).toLocaleDateString('en-CA', { timeZone })
  );
  const out: HallMenus = {};
  // A few days at a time: one by one takes minutes, all at once is rude.
  for (let i = 0; i < dates.length; i += 4) {
    await Promise.all(
      dates.slice(i, i + 4).map(async (date) => {
        const body = await fetchText(`${API}/${locationId}/${menuId}?date=${date}`, { 'API-Key': API_KEY });
        const day = parseSodexoDay(JSON.parse(body));
        if (Object.keys(day).length) out[date] = day;
      })
    );
  }
  return out;
}
