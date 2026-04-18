import { cleanup } from '@testing-library/preact';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

// Some test runtimes (bun's `--localstorage-file` default) expose a
// `localStorage` object that is missing standard methods. Detect that case
// and replace it with a minimal in-memory shim so tests can exercise
// localStorage-dependent code reliably.
const needsLocalStorageShim = (() => {
  if (typeof window === 'undefined') return false;
  const ls = (window as Window).localStorage;
  return !ls || typeof ls.removeItem !== 'function' || typeof ls.setItem !== 'function';
})();

if (needsLocalStorageShim) {
  const store = new Map<string, string>();
  const shim: Storage = {
    get length() {
      return store.size;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    getItem(key: string) {
      return store.has(key) ? (store.get(key) as string) : null;
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    writable: true,
    value: shim,
  });
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
