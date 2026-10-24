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
      className="grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-card active:scale-95"
    >
      {theme === 'dark' ? (
        <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
          <circle cx="10" cy="10" r="3.5" />
          <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
          <path d="M16.5 12.2A6.5 6.5 0 0 1 7.8 3.5a6.5 6.5 0 1 0 8.7 8.7z" />
        </svg>
      )}
    </button>
  );
}
