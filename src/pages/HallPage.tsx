// A dining hall: pick a day, set targets, and see the plan (or the full menu).
// The day and view live in the address (?date=2026-10-14&view=menu) so links share.
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import DayPicker from '../components/DayPicker';
import FullMenu from '../components/FullMenu';
import MealPlan from '../components/MealPlan';
import { Arrow } from '../components/Shapes';
import TargetsPanel from '../components/TargetsPanel';
import { Notice, Segmented, Skeleton } from '../components/ui';
import { findSchool, type DiningHall, type School } from '../data/schools';
import { dayLabel, menusAreOld, todayIn, updatedLabel, useHallDay, useSchoolIndex } from '../lib/data';
import { useStored } from '../lib/storage';
import { DEFAULT_TARGETS } from '../lib/targets';
import { useTitle } from '../lib/useTitle';
import NotFound from './NotFound';

export default function HallPage() {
  const { schoolId, hallId } = useParams();
  const school = findSchool(schoolId);
  const hall = school?.halls.find((h) => h.id === hallId);
  return school && hall ? <HallView key={hall.id} school={school} hall={hall} /> : <NotFound />;
}

type View = 'plan' | 'menu';

function HallView({ school, hall }: { school: School; hall: DiningHall }) {
  useTitle(hall.name);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [targets, setTargets] = useStored('targets', DEFAULT_TARGETS);
  const index = useSchoolIndex(school.id);
  const today = todayIn(school.timeZone);

  const days = index.status === 'ok' ? index.data.days : {};
  const dates = Object.keys(days).filter((d) => d >= today && days[d][hall.id]);
  const stale = index.status === 'ok' && !Object.keys(days).some((d) => d >= today);
  const wanted = params.get('date');
  const date = wanted && dates.includes(wanted) ? wanted : (dates[0] ?? null);
  const view: View = params.get('view') === 'menu' ? 'menu' : 'plan';
  const day = useHallDay(school.id, date, hall.id);

  const setParam = (key: string, value: string | null) =>
    setParams(
      (p) => {
        if (value == null) p.delete(key);
        else p.set(key, value);
        return p;
      },
      { replace: true }
    );

  return (
    <div className="animate-rise">
      <Link to={`/${school.id}`} className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
        <Arrow back className="size-4" /> {school.name}
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <div className="min-w-0">
          {/* The heading doubles as the hall switcher: a native select laid over it. */}
          <h1 className="relative inline-flex max-w-full items-center gap-3 text-4xl font-semibold tracking-[-0.035em] has-[select:focus-visible]:outline-2 has-[select:focus-visible]:outline-scarlet sm:text-6xl">
            <span className="truncate">{hall.name}</span>
            <svg viewBox="0 0 16 16" className="size-5 shrink-0 text-scarlet sm:size-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="m3 6 5 5 5-5" />
            </svg>
            <select
              value={hall.id}
              aria-label="Dining hall"
              onChange={(e) => navigate({ pathname: `/${school.id}/${e.target.value}`, search: params.toString() })}
              className="absolute inset-0 cursor-pointer appearance-none bg-bg text-base opacity-0"
            >
              {school.halls.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </h1>
          <p className="mt-2 text-muted">{hall.blurb}</p>
        </div>
        <a href={hall.menuUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
          Official menu
          <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M4 1h7v7M11 1 1 11" />
          </svg>
        </a>
      </div>

      <div className="mt-8">
        {index.status === 'loading' && <Skeleton className="h-[4.5rem] w-full max-w-xl" />}
        {index.status === 'error' && (
          <Notice tone="alert" action={<RetryButton onClick={index.retry} />}>Menus couldn’t load. Check your connection and try again.</Notice>
        )}
        {stale && <Notice>The menus haven’t been updated in a while. Check back soon.</Notice>}
        {index.status === 'ok' && !stale && menusAreOld(index.data.fetchedAt) && (
          <div className="mb-4">
            <Notice>
              These menus were last updated {updatedLabel(index.data.fetchedAt, school.timeZone)}, so dishes may have changed. Check the official menu before you go.
            </Notice>
          </div>
        )}
        {index.status === 'ok' && !stale && !dates.length && <Notice>{hall.name} hasn’t posted any upcoming menus.</Notice>}
        {dates.length > 0 && <DayPicker dates={dates} value={date} today={today} onChange={(d) => setParam('date', d === dates[0] ? null : d)} />}
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-10">
        <aside className="min-w-0 lg:sticky lg:top-24">
          <TargetsPanel targets={targets} onChange={setTargets} />
        </aside>

        <section aria-label={view === 'plan' ? 'Meal plan' : 'Full menu'} className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="w-full max-w-xs">
              <Segmented<View>
                label="View"
                value={view}
                options={[
                  { value: 'plan', label: 'Meal plan' },
                  { value: 'menu', label: 'Full menu' },
                ]}
                onChange={(v) => setParam('view', v === 'plan' ? null : v)}
              />
            </div>
            {date && <p className="font-display text-lg font-medium">{dayLabel(date, today)}</p>}
          </div>

          <div className="mt-6">
            {date && day.status === 'loading' && (
              <div className="space-y-4">
                <Skeleton className="h-32" />
                <Skeleton className="h-56" />
                <Skeleton className="h-56" />
              </div>
            )}
            {day.status === 'error' && (
              <Notice tone="alert" action={<RetryButton onClick={day.retry} />}>This day’s menu couldn’t load.</Notice>
            )}
            {day.status === 'ok' &&
              (view === 'plan' ? (
                <MealPlan key={date} day={day.data} targets={targets} source={school.name} />
              ) : (
                <FullMenu key={date} day={day.data} timeZone={date === today ? school.timeZone : null} />
              ))}
          </div>

          {index.status === 'ok' && (
            <p className="mt-8 text-xs text-muted">Menus updated {updatedLabel(index.data.fetchedAt, school.timeZone)}.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="border border-ink px-3 py-1 text-sm font-medium hover:bg-ink hover:text-bg">
      Try again
    </button>
  );
}
