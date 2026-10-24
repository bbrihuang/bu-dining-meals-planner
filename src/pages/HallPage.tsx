// A dining hall: pick a day, see your day add up on the goal card, and read the
// plan (or the full menu). The day and view live in the address
// (?date=2026-10-14&view=menu) so links share.
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import DayPicker from '../components/DayPicker';
import FullMenu from '../components/FullMenu';
import MealPlan, { usePlan } from '../components/MealPlan';
import { Arrow } from '../components/Shapes';
import TargetsPanel from '../components/TargetsPanel';
import { Notice, schoolScope, Segmented, Skeleton } from '../components/ui';
import { findSchool, type DiningHall, type School } from '../data/schools';
import { menusAreOld, todayIn, updatedLabel, useHallDay, useSchoolIndex } from '../lib/data';
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

function OfficialMenu({ hall, children = 'Official menu' }: { hall: DiningHall; children?: string }) {
  return (
    <a href={hall.menuUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-semibold text-ink underline underline-offset-4">
      {children}
      <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M4 1h7v7M11 1 1 11" />
      </svg>
    </a>
  );
}

function HallView({ school, hall }: { school: School; hall: DiningHall }) {
  useTitle(hall.name);
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [targets, setTargets] = useStored('targets', DEFAULT_TARGETS);
  const [prefs, setPrefs] = useStored('prefs', { showMacros: false });
  const index = useSchoolIndex(school.id);
  const today = todayIn(school.timeZone);

  const days = index.status === 'ok' ? index.data.days : {};
  const dates = Object.keys(days).filter((d) => d >= today && days[d][hall.id]);
  const stale = index.status === 'ok' && !Object.keys(days).some((d) => d >= today);
  const old = index.status === 'ok' && !stale && menusAreOld(index.data.fetchedAt);
  const wanted = params.get('date');
  const date = wanted && dates.includes(wanted) ? wanted : (dates[0] ?? null);
  const view: View = params.get('view') === 'menu' ? 'menu' : 'plan';
  const day = useHallDay(school.id, date, hall.id);
  const plan = usePlan(day.status === 'ok' ? day.data : null, targets, date);
  const showMacros = prefs.showMacros;

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
    <div {...schoolScope(school.color)}>
      <Link to={`/${school.id}`} className="-ml-1 inline-flex min-h-11 items-center gap-1.5 rounded-full px-1 text-sm font-medium text-muted hover:text-ink">
        <Arrow back className="size-4" /> {school.name}
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        {/* The heading doubles as the hall switcher: a native select laid over it. */}
        <h1 className="relative inline-flex max-w-full items-center gap-2 rounded-lg text-3xl font-bold tracking-tight has-[select:focus-visible]:outline-2 has-[select:focus-visible]:outline-offset-4 has-[select:focus-visible]:outline-ink sm:text-4xl">
          {/* The select below carries the name for assistive tech; reading both says it twice. */}
          <span className="truncate" aria-hidden="true">
            {hall.name}
          </span>
          <svg viewBox="0 0 16 16" className="size-5 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m4 6 4 4 4-4" />
          </svg>
          <select
            value={hall.id}
            aria-label="Dining hall"
            onChange={(e) => navigate({ pathname: `/${school.id}/${e.target.value}`, search: params.toString() })}
            className="absolute inset-0 cursor-pointer appearance-none bg-card text-base opacity-0"
          >
            {school.halls.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </h1>
        {/* When the menus are old, the notice below carries this link instead. */}
        {!old && (
          <p className="hidden pb-1 text-sm sm:block">
            <OfficialMenu hall={hall} />
          </p>
        )}
      </div>
      <p className="mt-0.5 hidden text-sm text-muted sm:block">{hall.blurb}</p>

      <div className="mt-4 space-y-3">
        {index.status === 'loading' && <Skeleton className="h-11 w-full max-w-md" />}
        {index.status === 'error' && (
          <Notice tone="alert" action={<RetryButton onClick={index.retry} />}>
            Menus couldn’t load. Check your connection and try again.
          </Notice>
        )}
        {stale && <Notice>The menus haven’t been updated in a while. Check back soon.</Notice>}
        {old && (
          <Notice>
            Menus last updated {updatedLabel(index.data.fetchedAt, school.timeZone)}, so dishes may have changed. Check the <OfficialMenu hall={hall}>official menu</OfficialMenu>{' '}
            before you go.
          </Notice>
        )}
        {index.status === 'ok' && !stale && !dates.length && <Notice>{hall.name} hasn’t posted any upcoming menus.</Notice>}
        {dates.length > 0 && <DayPicker dates={dates} value={date} today={today} onChange={(d) => setParam('date', d === dates[0] ? null : d)} />}
      </div>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-8">
        <aside className="min-w-0 lg:sticky lg:top-24">
          <TargetsPanel
            targets={targets}
            onChange={setTargets}
            planned={view === 'plan' ? plan.total : null}
            showMacros={showMacros}
            onShowMacros={(on) => setPrefs({ ...prefs, showMacros: on })}
            excluded={plan.excluded}
            onBringBack={plan.bringBack}
          />
        </aside>

        <section aria-labelledby="view-title" className="min-w-0">
          <h2 id="view-title" className="sr-only">
            {view === 'plan' ? 'Your plan' : 'Full menu'}
          </h2>
          <Segmented<View>
            label="View"
            value={view}
            options={[
              { value: 'plan', label: 'Your plan' },
              { value: 'menu', label: 'Full menu' },
            ]}
            onChange={(v) => setParam('view', v === 'plan' ? null : v)}
          />

          <div className="mt-4">
            {date && day.status === 'loading' && (
              <div className="space-y-4">
                <Skeleton className="h-56" />
                <Skeleton className="h-56" />
              </div>
            )}
            {day.status === 'error' && (
              <Notice tone="alert" action={<RetryButton onClick={day.retry} />}>
                This day’s menu couldn’t load.
              </Notice>
            )}
            {day.status === 'ok' &&
              (view === 'plan' ? (
                <MealPlan day={day.data} plan={plan} timeZone={date === today ? school.timeZone : null} showMacros={showMacros} />
              ) : (
                <FullMenu key={date} day={day.data} timeZone={date === today ? school.timeZone : null} showMacros={showMacros} />
              ))}
          </div>

          {/* One provenance line; the stale notice already says when menus were updated. */}
          {index.status === 'ok' && !old && (
            <p className="mt-6 text-xs text-muted">
              Menus updated {updatedLabel(index.data.fetchedAt, school.timeZone)} from {school.name}’s dining site. <span className="sm:hidden"><OfficialMenu hall={hall} /></span>
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function RetryButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="button button-ink button-compact">
      Try again
    </button>
  );
}
