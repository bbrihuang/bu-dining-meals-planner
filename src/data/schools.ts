// Every school the site knows about. Adding a school starts here: give it an entry
// below, and if its menus come from a kind of website the scraper can't read yet,
// add a reader in scripts/providers/.

/** Which reader in scripts/providers/ understands a hall's menus. */
export type ProviderName = 'bu' | 'sodexo';

export interface DiningHall {
  /** Used in the web address and data files, e.g. "warren". */
  id: string;
  name: string;
  /** One line about the hall, shown under its name. */
  blurb: string;
  /** The hall's own menu page, for people (the BU reader also downloads it). */
  menuUrl: string;
  /** Overrides the school's reader for this hall. */
  provider?: ProviderName;
  /** Which menu to ask the reader for; each reader says what it expects. */
  feed?: string;
}

export interface School {
  /** Used in the web address and data files, e.g. "bu". */
  id: string;
  name: string;
  /** Two or three letters for the school's badge. */
  short: string;
  /** The school colour, used for the band on your goal card and the selected day. */
  color: string;
  city: string;
  provider: ProviderName;
  /** The dining halls' time zone, so "today" means the school's today. */
  timeZone: string;
  halls: DiningHall[];
}

export const SCHOOLS: School[] = [
  {
    id: 'bu',
    name: 'Boston University',
    short: 'BU',
    color: '#cc0000',
    city: 'Boston, MA',
    provider: 'bu',
    timeZone: 'America/New_York',
    halls: [
      { id: 'warren', name: 'Warren Towers', blurb: '18 stations and a dedicated gluten-free kitchen', menuUrl: 'https://www.bu.edu/dining/location/warren/' },
      { id: 'marciano', name: 'Marciano Commons', blurb: 'One of the longest salad bars on campus', menuUrl: 'https://www.bu.edu/dining/location/marciano/' },
      { id: 'west', name: 'West Campus', blurb: 'Full vegan station and allergen-friendly True Balance', menuUrl: 'https://www.bu.edu/dining/location/west/' },
      {
        id: 'fenway',
        name: 'Fenway',
        blurb: 'The Fenway Campus dining hall, run by Sodexo',
        menuUrl: 'https://bufenway.sodexomyway.com/en-us/locations/the-fenway-dining-hall',
        provider: 'sodexo', // run by Sodexo, not BU Dining
        feed: '31992001/152621',
      },
    ],
  },
];

export const findSchool = (id: string | undefined) => SCHOOLS.find((s) => s.id === id);
