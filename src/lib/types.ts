// Shared shapes for the menu data (written by scripts/scrape.ts) and the planner.

/** Meal periods, in the order they happen. */
export type Period = 'breakfast' | 'brunch' | 'lunch' | 'dinner';

export const PERIODS: Period[] = ['breakfast', 'brunch', 'lunch', 'dinner'];

export const PERIOD_LABEL: Record<Period, string> = {
  breakfast: 'Breakfast',
  brunch: 'Brunch',
  lunch: 'Lunch',
  dinner: 'Dinner',
};

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** One dish as the dining hall lists it, for ONE serving as printed on its label. */
export interface MenuItem {
  id: string;
  name: string;
  station: string;
  description?: string;
  /** Serving size text, normalized to "<amount> <unit>" where possible: "1/2 cup", "2 link". */
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  /** Diet labels: vegetarian, vegan, halal, gluten-free. */
  tags: string[];
  /** Egg, Fish, Milk, Peanuts, Sesame, Shellfish, Soy, Tree Nuts, Wheat. */
  allergens: string[];
  /**
   * Set on a "Create Your Own" station (omelet bar, salad bar, stir fry): the
   * ingredients you pick from, each with its own label. The station's own numbers
   * are all 0; the planner uses the options.
   */
  options?: MenuItem[];
  /** On an option: the name of the "Create Your Own" station it belongs to. */
  from?: string;
}

export interface Meal {
  /** Serving hours as the hall prints them, e.g. "7:00 AM - 10:30 AM". */
  hours?: string;
  items: MenuItem[];
}

/** One hall's menu for one day: public/data/<school>/<date>/<hall>.json */
export type HallDay = Partial<Record<Period, Meal>>;

/** public/data/<school>/index.json: which halls have menus on which days, and their hours. */
export interface SchoolIndex {
  fetchedAt: string;
  /** date → hall id → meal → hours ("" when the hall doesn't print hours). */
  days: Record<string, Record<string, Partial<Record<Period, string>>>>;
}

/** An item on a planned plate, in a real-world amount. */
export interface PlateItem {
  item: MenuItem;
  /** Number of label servings (only amounts portions.ts allows). */
  servings: number;
}

export interface Plate {
  items: PlateItem[];
  macros: Macros;
}
