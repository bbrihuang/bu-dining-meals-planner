// A school: pick one of its dining halls. Each card shows what it serves today.
import { Link, useParams } from 'react-router';
import { Arrow, HallGlyph } from '../components/Shapes';
import { findSchool, type School } from '../data/schools';
import { longDate, todayIn, updatedLabel, useSchoolIndex } from '../lib/data';
import { PERIOD_LABEL, PERIODS } from '../lib/types';
import { useTitle } from '../lib/useTitle';
import NotFound from './NotFound';

export default function SchoolPage() {
  const school = findSchool(useParams().schoolId);
  return school ? <SchoolView school={school} /> : <NotFound />;
}

function SchoolView({ school }: { school: School }) {
  useTitle(school.name);
  const index = useSchoolIndex(school.id);
  const today = todayIn(school.timeZone);
  const todays = index.status === 'ok' ? index.data.days[today] : undefined;

  return (
    <div className="animate-rise">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <Arrow back className="size-4" /> All schools
      </Link>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div className="flex items-center gap-5">
          <span className="grid size-16 shrink-0 place-items-center bg-scarlet font-display text-2xl font-bold text-on-scarlet sm:size-20 sm:text-3xl">
            {school.short}
          </span>
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.035em] sm:text-6xl">{school.name}</h1>
            <p className="mt-1 text-muted">{school.city}</p>
          </div>
        </div>
        <p className="text-sm text-muted">
          <span className="font-medium text-ink">Today</span> · {longDate(today)}
        </p>
      </div>

      <h2 id="halls" className="mt-10 font-sans text-sm font-semibold uppercase tracking-[0.14em]">
        Choose a dining hall
      </h2>
      <ul aria-labelledby="halls" className="mt-4 grid gap-3 sm:grid-cols-2">
        {school.halls.map((hall, i) => {
          const meals = todays?.[hall.id];
          return (
            <li key={hall.id} className="animate-rise" style={{ animationDelay: `${60 * i}ms` }}>
              <Link
                to={`/${school.id}/${hall.id}`}
                className="group relative flex h-full flex-col border border-line bg-bg p-6 transition-colors hover:border-ink"
              >
                <div className="flex items-start justify-between">
                  <span className="font-display text-sm tabular-nums text-muted">0{i + 1}</span>
                  <HallGlyph index={i} className="size-9 text-ink transition-colors duration-300 group-hover:text-scarlet" />
                </div>
                <h3 className="mt-8 text-3xl font-semibold tracking-tight">{hall.name}</h3>
                <p className="mt-1 text-sm text-muted">{hall.blurb}</p>

                <div className="mt-6 flex-1 border-t border-line pt-4 text-sm">
                  {index.status === 'loading' && <div className="h-10 animate-pulse bg-surface" />}
                  {index.status === 'error' && <p className="text-muted">Today’s hours couldn’t load.</p>}
                  {index.status === 'ok' && !meals && <p className="text-muted">No menu posted for today.</p>}
                  {meals && (
                    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
                      {PERIODS.filter((p) => p in meals).map((p) => (
                        <div key={p} className="contents">
                          <dt className="font-medium">{PERIOD_LABEL[p]}</dt>
                          <dd className="text-right tabular-nums text-muted">{meals[p] || '—'}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>

                <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium">
                  Plan my meals
                  <Arrow className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-scarlet transition-transform duration-300 group-hover:scale-x-100" aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>

      {index.status === 'ok' && (
        <p className="mt-6 text-xs text-muted">Menus updated {updatedLabel(index.data.fetchedAt, school.timeZone)}.</p>
      )}
    </div>
  );
}
