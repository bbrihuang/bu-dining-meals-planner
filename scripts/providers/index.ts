// Menu readers, one per kind of dining website. A school in src/data/schools.ts
// names its reader with `provider` (a hall can override it). Each reader downloads
// one hall's menus and returns them keyed by date.
import type { DiningHall, ProviderName } from '../../src/data/schools.ts';
import type { HallDay } from '../../src/lib/types.ts';
import { parseBuPage } from './bu.ts';
import { readSodexoHall } from './sodexo.ts';

/** One hall's menus, keyed by date (YYYY-MM-DD). */
export type HallMenus = Record<string, HallDay>;

export type FetchText = (url: string, headers?: Record<string, string>) => Promise<string>;

export type Reader = (hall: DiningHall, fetchText: FetchText, timeZone: string) => Promise<HallMenus>;

export const READERS: Record<ProviderName, Reader> = {
  bu: async (hall, fetchText) => parseBuPage(await fetchText(hall.menuUrl)),
  sodexo: readSodexoHall,
};
