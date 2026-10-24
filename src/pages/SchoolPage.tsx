// A school: pick one of its dining halls. Each card shows today's meals and what's open now.
import { Link, useParams } from 'react-router';
import { Arrow } from '../components/Shapes';
import { schoolScope, StateChip } from '../components/ui';
import { findSchool, type School } from '../data/schools';
import { longDate, servingState, todayIn, updatedLabel, useSchoolIndex } from '../lib/data';
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
    <div {...schoolScope(school.color)}>
      <Link to="/" className="-ml-1 inline-flex min-h-11 items-center gap-1.5 rounded-full px-1 text-sm font-medium text-muted hover:text-ink">
        <Arrow back className="size-4" /> All schools
      </Link>

      <div className="mt-1 flex flex-wrap items-center gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-school text-xl font-bold text-on-school">{school.short}</span>
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{school.name}</h1>
          <p className="text-sm text-muted">{longDate(today)}</p>
        </div>
      </div>

      <h2 id="halls" className="mt-8 text-lg font-bold">
        Pick your dining hall
      </h2>
      <ul aria-labelledby="halls" className="mt-3 grid gap-3 sm:grid-cols-2">
        {school.halls.map((hall) => {
          const meals = todays?.[hall.id];
          const periods = meals ? PERIODS.filter((p) => p in meals) : [];
          const openNow = periods.some((p) => servingState(meals?.[p], school.timeZone) === 'open');
          return (
            <li key={hall.id}>
              <Link to={`/${school.id}/${hall.id}`} className="card group flex h-full flex-col p-5 transition-transform duration-150 active:scale-[0.99]">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-2xl font-bold tracking-tight">{hall.name}</h3>
                  {openNow && <StateChip state="open" />}
                </div>
                <p className="mt-1 text-sm text-muted">{hall.blurb}</p>

                <div className="mt-4 flex-1 text-sm">
                  {index.status === 'loading' && <div className="h-16 animate-pulse rounded-xl bg-surface" />}
                  {index.status === 'error' && <p className="text-muted">Today’s hours couldn’t load.</p>}
                  {index.status === 'ok' && !meals && <p className="text-muted">No menu posted for today.</p>}
                  {meals && !periods.some((p) => meals[p]) && <p className="text-muted">Hours not posted for today.</p>}
                  {meals && periods.some((p) => meals[p]) && (
                    <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 border-t border-line pt-3">
                      {periods.map((p) => {
                        const on = servingState(meals[p], school.timeZone) === 'open';
                        return (
                          <div key={p} className="contents">
                            <dt className={on ? 'font-bold' : 'font-medium'}>{PERIOD_LABEL[p]}</dt>
                            <dd className={`text-right ${on ? 'font-semibold text-ink' : 'text-muted'}`}>{meals[p] || '—'}</dd>
                          </div>
                        );
                      })}
                    </dl>
                  )}
                </div>

                <span className="mt-4 inline-flex items-center gap-2 font-semibold">
                  Plan my meals
                  <Arrow className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      {index.status === 'ok' && <p className="mt-6 text-xs text-muted">Menus updated {updatedLabel(index.data.fetchedAt, school.timeZone)}.</p>}
    </div>
  );
}
