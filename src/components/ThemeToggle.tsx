// Light / dark switch. The page starts in the saved theme or the system's (see the
// script in index.html); clicking flips it and remembers the choice.
import { useState } from 'react';

type Theme = 'light' | 'dark';

const current = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(current);
  const next: Theme = theme === 'dark' ? 'light' : 'dark';

  const flip = () => {
    document.documentElement.dataset.theme = next;
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);
    try {
      localStorage.setItem('theme', next);
    } catch {
      // Not remembered, but still switched.
    }
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={flip}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="group grid size-11 place-items-center border border-line text-ink transition-colors hover:border-ink"
    >
      {/* A half-filled circle that turns over: filled half on the left in light mode, on the right in dark. */}
      <svg viewBox="0 0 20 20" className="size-5 transition-transform duration-500 ease-out" style={{ transform: `rotate(${theme === 'dark' ? 180 : 0}deg)` }} aria-hidden="true">
        <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 2a8 8 0 0 0 0 16z" fill="currentColor" />
      </svg>
    </button>
  );
}
