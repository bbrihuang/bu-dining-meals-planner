# Dining Hall Planner: developer notes

How the site is built, run and deployed. For how to use it, see the [README](README.md).

Built with React, TypeScript, Tailwind CSS and Vite. Hosted on Vercel.

## How it works

- The site is static: no server, no database, no API keys.
- Every Vercel build runs `npm run scrape`, which downloads each hall's menus and saves
  them as small JSON files in `public/data/<school>/`. BU's own pages hold two weeks of
  menus each (20+ MB of HTML), so they're read once at build time, never per visitor.
- A GitHub Action asks Vercel to rebuild at about 5 am and 2 pm Boston time.
- If a hall's site is down during a build, that hall is skipped until the next one. If
  nothing can be read at all, the build fails and Vercel keeps the last good version live.
- The planner runs in the browser. For each meal it tries every sensible plate (protein +
  starch + vegetable, an entree + a side, ...) in portions you can actually take (whole
  pieces, quarter cups, whole ounces) and keeps the closest fits. Each meal aims at what's
  left of the day after the meals before it, so the day adds up.

## Run it on your computer

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
```

```bash
npm run scrape
```

```bash
npm run dev
```

`npm run scrape` takes about a minute. `npm test` checks the menu readers against saved
copies of BU's and Sodexo's pages, and the planner and calculator against real BU days.

## Put it on Vercel (one time)

1. Push this folder to a GitHub repository.
2. On [vercel.com](https://vercel.com), click **Add New → Project**, pick the repository,
   and click **Deploy**. Leave the settings alone; `vercel.json` already says what to do.

### Turn on the twice-a-day menu refresh

1. In Vercel: project → **Settings → Git → Deploy Hooks**. Name it `refresh menus`,
   branch `main`, click **Create Hook**, and copy the URL.
2. In GitHub: repo → **Settings → Secrets and variables → Actions → New repository
   secret**. Name: `VERCEL_DEPLOY_HOOK`. Value: the URL.
3. To test it: GitHub → **Actions → Refresh menus → Run workflow**. A new deployment
   should appear in Vercel a few seconds later.

## Adding a school

1. Add it to `src/data/schools.ts`: name, badge letters, city, time zone, and each dining
   hall (dining halls only, not cafés or retail).
2. If its menus come from a kind of site the scraper can't read yet, add a reader in
   `scripts/providers/` (`sodexo.ts` is a short example) and list it in
   `scripts/providers/index.ts`.
3. Save a copy of one of its menu pages in `test/fixtures/` and add a test for the reader.

The home page, school page and planner pick the new school up on their own.

## Where things are

| Path | What it is |
| --- | --- |
| `src/data/schools.ts` | Schools and their dining halls |
| `scripts/scrape.ts` | Downloads menus at build time |
| `scripts/providers/` | Menu readers: `bu.ts` (BU Dining's pages), `sodexo.ts` (Fenway) |
| `src/pages/` | Home (pick a school), school page (pick a hall), hall page |
| `src/components/MealPlan.tsx` | The day's plates, "another option" and "not this" |
| `src/components/FullMenu.tsx` | Every dish by station, with "Create Your Own" options |
| `src/components/MacroCalculator.tsx` | The "Calculate my macros" dialog |
| `src/lib/planner.ts` | Builds plates that hit the targets |
| `src/lib/classify.ts` | Which dishes can anchor a plate (no sauces, drinks or desserts) |
| `src/lib/portions.ts` | Serving sizes → amounts you can take ("1½ cups", "3 links") |
| `src/lib/macros.ts` | Calorie and macro math for the calculator |
| `src/index.css` | Colour tokens for light and dark mode |
| `test/` | Tests and saved menu pages |
