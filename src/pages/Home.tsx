// Home: welcome, and pick your school.
import { useState } from 'react';
import { Link } from 'react-router';
import HeroArt from '../components/HeroArt';
import { Arrow, MacroShape } from '../components/Shapes';
import { SCHOOLS, type School } from '../data/schools';
import { useTitle } from '../lib/useTitle';

/** Above this many schools, a search box appears over the list. */
const SEARCH_FROM = 7;

const STEPS = [
  {
    shape: 'carbs' as const,
    title: 'Pick a dining hall',
    text: 'See every station’s menu with calories and macros, up to two weeks ahead.',
  },
  {
    shape: 'protein' as const,
    title: 'Set your targets',
    text: 'Type them in, or let the calculator work them out from your height, weight, activity and goal.',
  },
  {
    shape: 'fat' as const,
    title: 'Get your plates',
    text: 'A plate for every meal that adds up to your day, in amounts you can actually take.',
  },
];

export default function Home() {
  useTitle(null);
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const schools = SCHOOLS.filter((s) => !q || [s.name, s.short, s.city].some((t) => t.toLowerCase().includes(q)));

  return (
    <>
      <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:gap-20">
        <section className="animate-rise">
          <p className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-muted">
            <span className="h-px w-8 bg-scarlet" aria-hidden="true" />
            Meal planning for campus dining
          </p>
          <h1 className="mt-5 text-6xl font-semibold leading-[0.95] tracking-[-0.045em] sm:text-8xl">
            Welcome<span className="text-scarlet">!</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Set your calories and macros, and get a plate for every meal built from what your dining hall is serving.
          </p>

          <h2 id="pick-school" className="mt-14 font-sans text-sm font-semibold uppercase tracking-[0.14em]">
            Please select your school:
          </h2>
          {SCHOOLS.length >= SEARCH_FROM && (
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search schools"
              aria-label="Search schools"
              className="mt-4 h-12 w-full border border-line bg-bg px-4 outline-none placeholder:text-muted focus:border-ink"
            />
          )}
          <ul aria-labelledby="pick-school" className="mt-4 grid gap-3">
            {schools.map((school) => (
              <li key={school.id}>
                <SchoolCard school={school} />
              </li>
            ))}
            <li className="flex items-center gap-3 border border-dashed border-line-strong px-5 py-4 text-sm text-muted">
              <span className="size-2 rotate-45 bg-line-strong" aria-hidden="true" />
              More schools are on the way.
            </li>
          </ul>
        </section>

        <HeroArt className="w-full max-w-md animate-fade justify-self-center [animation-delay:150ms] lg:mt-6 lg:justify-self-end" />
      </div>

      <section aria-label="How it works" className="mt-20 grid gap-px border border-line bg-line sm:mt-28 sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <div key={step.title} className="bg-bg p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm tabular-nums text-muted">0{i + 1}</span>
              <MacroShape macro={step.shape} className="size-3" />
            </div>
            <h3 className="mt-10 text-xl font-semibold tracking-tight">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
          </div>
        ))}
      </section>
    </>
  );
}

function SchoolCard({ school }: { school: School }) {
  return (
    <Link
      to={`/${school.id}`}
      className="group relative flex items-center gap-5 overflow-hidden border border-line bg-bg p-4 transition-colors hover:border-ink sm:p-5"
    >
      <span className="grid size-14 shrink-0 place-items-center bg-scarlet font-display text-xl font-bold tracking-tight text-on-scarlet">
        {school.short}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-xl font-semibold tracking-tight">{school.name}</span>
        <span className="mt-0.5 block text-sm text-muted">
          {school.city} · {school.halls.length} dining halls
        </span>
      </span>
      <Arrow className="size-5 text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-ink" />
      <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-scarlet transition-transform duration-300 group-hover:scale-x-100" aria-hidden="true" />
    </Link>
  );
}
