// The days with a menu, as pills: "Today", then weekday and date. Scrolls sideways on phones.
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
    <div className="no-scrollbar -mx-4 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-0" role="group" aria-label="Day">
      <div className="flex w-max gap-2">
        {dates.map((d) => {
          const selected = d === value;
          return (
            <button
              key={d}
              type="button"
              onClick={() => onChange(d)}
              aria-pressed={selected}
              className={`pill ${selected ? '!bg-school !text-on-school' : ''}`}
            >
              <span>{d === today ? 'Today' : weekday(d)}</span>
              <span className={selected ? 'font-medium' : 'text-muted'}>{dayOfMonth(d)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
