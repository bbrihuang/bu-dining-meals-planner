// Loads the menu files written by scripts/scrape.ts, and date helpers for them.
import { useEffect, useState } from 'react';
import type { HallDay, SchoolIndex } from './types';

const cache = new Map<string, Promise<unknown>>();

function getJson<T>(url: string): Promise<T> {
  let p = cache.get(url) as Promise<T> | undefined;
  if (!p) {
    p = fetch(url).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json() as Promise<T>;
    });
    p.catch(() => cache.delete(url)); // let a retry fetch again
    cache.set(url, p);
  }
  return p;
}

export type Loaded<T> = { status: 'loading' } | { status: 'error'; retry: () => void } | { status: 'ok'; data: T };

/** Fetches `url` (null = nothing yet) and tracks loading / error / done. */
function useJson<T>(url: string | null): Loaded<T> {
  const [state, setState] = useState<{ url: string | null; result: Loaded<T> }>({ url, result: { status: 'loading' } });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!url) return;
    let live = true;
    setState({ url, result: { status: 'loading' } });
    getJson<T>(url).then(
      (data) => live && setState({ url, result: { status: 'ok', data } }),
      () => live && setState({ url, result: { status: 'error', retry: () => setAttempt((n) => n + 1) } })
    );
    return () => {
      live = false;
    };
  }, [url, attempt]);
  // While a new url loads, never show the previous url's data.
  return state.url === url ? state.result : { status: 'loading' };
}

export const useSchoolIndex = (school: string) => useJson<SchoolIndex>(`/data/${school}/index.json`);

export const useHallDay = (school: string, date: string | null, hall: string) =>
  useJson<HallDay>(date ? `/data/${school}/${date}/${hall}.json` : null);

/** Today (YYYY-MM-DD) where the school is. */
export const todayIn = (timeZone: string) => new Date().toLocaleDateString('en-CA', { timeZone });

const noon = (date: string) => new Date(`${date}T12:00:00`);

/** "Today", "Tomorrow", or "Wed, Oct 14". */
export function dayLabel(date: string, today: string): string {
  const diff = Math.round((noon(date).getTime() - noon(today).getTime()) / 86_400_000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return noon(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export const weekday = (date: string) => noon(date).toLocaleDateString('en-US', { weekday: 'short' });
export const dayOfMonth = (date: string) => noon(date).getDate();
export const longDate = (date: string) => noon(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

/** Minutes since midnight where the school is. */
export function minutesNow(timeZone: string): number {
  const [h, m] = new Date().toLocaleTimeString('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false }).split(':').map(Number);
  return (h % 24) * 60 + m;
}

/** "7:00 AM – 11:00 AM" → [420, 660] minutes; null if it doesn't read. */
export function parseHours(hours: string | undefined): [number, number] | null {
  const times = [...(hours ?? '').matchAll(/(\d{1,2}):(\d{2})\s*([AP]M)/gi)].map(
    ([, h, m, ap]) => ((Number(h) % 12) + (ap.toUpperCase() === 'PM' ? 12 : 0)) * 60 + Number(m)
  );
  return times.length === 2 ? [times[0], times[1]] : null;
}

/** When menus were last downloaded: "today at 5:15 AM", "Oct 8 at 2:04 PM". */
export function updatedLabel(iso: string, timeZone: string): string {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return '';
  const time = at.toLocaleTimeString('en-US', { timeZone, hour: 'numeric', minute: '2-digit' });
  const day = at.toLocaleDateString('en-CA', { timeZone });
  const label = dayLabel(day, todayIn(timeZone));
  return `${label === 'Today' ? 'today' : at.toLocaleDateString('en-US', { timeZone, month: 'short', day: 'numeric' })} at ${time}`;
}
