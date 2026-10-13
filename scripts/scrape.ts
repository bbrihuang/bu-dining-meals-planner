// Downloads every school's menus and writes them as small JSON files the site loads.
//
//   npm run scrape
//
// For each school:
//   public/data/<school>/index.json           which halls serve which meals on which days
//   public/data/<school>/<date>/<hall>.json   one hall's full menu for one day
//
// Vercel runs this on every build (see vercel.json). A hall whose site is down is
// skipped until the next build; if nothing at all could be read, the script fails so
// Vercel keeps the last good deployment live.
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { SCHOOLS, type School } from '../src/data/schools.ts';
import type { SchoolIndex } from '../src/lib/types.ts';
import { READERS, type FetchText } from './providers/index.ts';

const OUT = path.resolve('public/data');
const USER_AGENT = 'dining-hall-planner (student project; reads menus twice a day)';

const fetchText: FetchText = async (url, headers = {}) => {
  for (let attempt = 1; ; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, ...headers }, signal: AbortSignal.timeout(120_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (err) {
      if (attempt === 3) throw err;
      console.warn(`  retrying ${url} (${(err as Error).message})`);
      await new Promise((r) => setTimeout(r, 4000 * attempt));
    }
  }
};

async function scrapeSchool(school: School, fetchedAt: string): Promise<boolean> {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: school.timeZone });
  const index: SchoolIndex = { fetchedAt, days: {} };
  const files: [string, unknown][] = [];

  // Halls one at a time: BU's pages are big, and this is gentler on their servers.
  for (const hall of school.halls) {
    const started = Date.now();
    try {
      const menus = await READERS[hall.provider ?? school.provider](hall, fetchText, school.timeZone);
      const dates = Object.keys(menus).filter((d) => d >= today).sort();
      for (const date of dates) {
        const day = menus[date];
        index.days[date] ??= {};
        index.days[date][hall.id] = Object.fromEntries(Object.entries(day).map(([p, meal]) => [p, meal.hours ?? '']));
        files.push([path.join(date, `${hall.id}.json`), day]);
      }
      const items = dates.reduce((n, d) => n + Object.values(menus[d]).reduce((m, meal) => m + meal.items.length, 0), 0);
      console.log(`  ${hall.name}: ${dates.length} days, ${items} items (${((Date.now() - started) / 1000).toFixed(1)}s)`);
    } catch (err) {
      console.error(`  FAILED ${hall.name}: ${(err as Error).message}`);
    }
  }

  if (!files.length) return false;
  const dir = path.join(OUT, school.id);
  await rm(dir, { recursive: true, force: true });
  for (const [file, data] of files) {
    await mkdir(path.dirname(path.join(dir, file)), { recursive: true });
    await writeFile(path.join(dir, file), JSON.stringify(data));
  }
  index.days = Object.fromEntries(Object.entries(index.days).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(path.join(dir, 'index.json'), JSON.stringify(index));
  return true;
}

const fetchedAt = new Date().toISOString();
let ok = 0;
for (const school of SCHOOLS) {
  console.log(school.name);
  if (await scrapeSchool(school, fetchedAt)) ok++;
  else console.error(`  no menus for ${school.name}; its site may be down or changed`);
}
if (!ok) {
  console.error('No menus found for any school.');
  process.exit(1);
}
