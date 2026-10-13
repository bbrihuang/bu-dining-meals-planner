import { useEffect } from 'react';

/** Sets the browser tab's title: "Warren Towers · Dining Hall Planner". */
export function useTitle(title: string | null) {
  useEffect(() => {
    document.title = title ? `${title} · Dining Hall Planner` : 'Dining Hall Planner';
  }, [title]);
}
