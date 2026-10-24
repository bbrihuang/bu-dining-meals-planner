// Home: welcome, and pick your school.
import { useState } from 'react';
import { Link } from 'react-router';
import { Arrow } from '../components/Shapes';
import { schoolScope } from '../components/ui';
import { SCHOOLS, type School } from '../data/schools';
import { useTitle } from '../lib/useTitle';

/** Above this many schools, a search box appears over the list. */
const SEARCH_FROM = 7;

export default function Home() {
  useTitle(null);
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const schools = SCHOOLS.filter((s) => !q || [s.name, s.short, s.city].some((t) => t.toLowerCase().includes(q)));

  return (
    <div className="mx-auto max-w-2xl pt-6 sm:pt-12">
      <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">Welcome!</h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        Pick your dining hall and get a plate for every meal, built from what it’s serving today, in amounts you can
        actually take.
      </p>

      <h2 id="pick-school" className="mt-10 text-lg font-bold">
        Pick your school
      </h2>
      {SCHOOLS.length >= SEARCH_FROM && (
        <label className="field mt-3">
          <span className="sr-only">Search schools</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search schools"
            className="w-full min-w-0 bg-transparent outline-none placeholder:text-muted"
          />
        </label>
      )}
      <ul aria-labelledby="pick-school" className="mt-3 grid gap-3">
        {schools.map((school) => (
          <li key={school.id}>
            <SchoolCard school={school} />
          </li>
        ))}
      </ul>
      <p className="mt-3 px-1 text-sm text-muted">More schools are on the way.</p>
    </div>
  );
}

function SchoolCard({ school }: { school: School }) {
  return (
    <Link
      to={`/${school.id}`}
      {...schoolScope(school.color)}
      className="card group flex items-center gap-4 p-4 transition-transform duration-150 active:scale-[0.99] sm:p-5"
    >
      <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-school text-xl font-bold text-on-school">{school.short}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xl font-bold tracking-tight">{school.name}</span>
        <span className="mt-0.5 block text-sm text-muted">
          {school.city} · {school.halls.length} dining halls
        </span>
      </span>
      <Arrow className="size-5 text-muted transition-transform duration-200 group-hover:translate-x-1 group-hover:text-ink" />
    </Link>
  );
}
