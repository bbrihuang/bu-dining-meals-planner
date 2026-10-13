// Small building blocks shared by several screens.
import type { ReactNode } from 'react';

/** A row of mutually exclusive choices with a sliding square marker. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  size = 'md',
}: {
  label: string;
  value: T;
  options: { value: T; label: ReactNode }[];
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
}) {
  const at = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`relative grid border border-line p-1 ${size === 'sm' ? 'h-10' : 'h-11'}`}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 bg-ink transition-transform duration-300 ease-out"
        style={{ width: `calc((100% - 0.5rem) / ${options.length})`, transform: `translateX(${at * 100}%)` }}
      />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={`relative z-10 truncate px-2 text-sm font-medium transition-colors duration-300 ${
            o.value === value ? 'text-bg' : 'text-muted hover:text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Notice({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-l-2 border-scarlet bg-surface px-4 py-3 text-sm">
      <p>{children}</p>
      {action}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-surface ${className}`} aria-hidden="true" />;
}

/** Section label: small, spaced capitals. */
export function Eyebrow({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2 id={id} className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-muted">
      {children}
    </h2>
  );
}
