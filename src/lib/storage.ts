// Remembers targets and calculator answers in this browser. Wrapped in try/catch
// because private windows and some browsers block storage.
import { useState } from 'react';

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable: settings just won't be remembered.
  }
}

/** Has this browser saved anything under `key` yet? */
export function hasStored(key: string): boolean {
  try {
    return localStorage.getItem(key) != null;
  } catch {
    return false;
  }
}

/** useState that's saved under `key` and restored on the next visit. */
export function useStored<T>(key: string, fallback: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => load(key, fallback));
  return [
    value,
    (next: T) => {
      setValue(next);
      save(key, next);
    },
  ];
}
