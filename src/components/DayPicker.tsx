// A row of square day tiles: weekday on top, date below. Scrolls sideways on phones.
import { dayOfMonth, weekday } from '../lib/data';

export default function DayPicker({
  dates,
  value,
  today,
  onChange,
}: {
  dates: string[];
  value: string | null;
  today: string;
  onChange: (date: string) => void;
}) {
  return (
    <div className="no-scrollbar -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Day">
      <div className="flex w-max gap-2">
        {dates.map((d) => {
          const selected = d === value;
          return (
            <button
              key={d}
              type="button"
              onClick={() => onChange(d)}
              aria-pressed={selected}
              className={`flex h-[4.5rem] w-16 shrink-0 flex-col items-center justify-center gap-1 border transition-colors ${
                selected ? 'border-scarlet bg-scarlet text-on-scarlet' : 'border-line hover:border-ink'
              }`}
            >
              <span className={`text-[0.7rem] font-semibold uppercase tracking-[0.12em] ${selected ? '' : d === today ? 'text-scarlet-ink' : 'text-muted'}`}>
                {d === today ? 'Today' : weekday(d)}
              </span>
              <span className="font-display text-2xl font-semibold leading-none tabular-nums">{dayOfMonth(d)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
