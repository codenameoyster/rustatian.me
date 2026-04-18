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
  // Inherit from Storage.prototype so tests that do `vi.spyOn(Storage.prototype,
  // 'setItem')` still intercept the shim's calls.
  const proto = typeof Storage !== 'undefined' ? Storage.prototype : Object.prototype;
  const shim = Object.create(proto) as Storage;
  Object.defineProperties(shim, {
    length: { get: () => store.size },
    key: { value: (index: number) => Array.from(store.keys())[index] ?? null },
    getItem: { value: (key: string) => (store.has(key) ? (store.get(key) as string) : null) },
    setItem: { value: (key: string, value: string) => void store.set(key, String(value)) },
    removeItem: { value: (key: string) => void store.delete(key) },
    clear: { value: () => store.clear() },
  });
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
