import { useEffect, useState } from 'preact/hooks';

type Theme = 'light' | 'dark';
export const STORAGE_KEY = 'rustatian-v2-theme';
const LIGHT_QUERY = '(prefers-color-scheme: light)';

const readStoredTheme = (): Theme | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* storage access blocked (e.g. Safari strict-private) — fall through */
  }
  return null;
};

const readSystemTheme = (): Theme =>
  typeof window !== 'undefined' && window.matchMedia?.(LIGHT_QUERY).matches ? 'light' : 'dark';

const readInitialTheme = (): Theme => readStoredTheme() ?? readSystemTheme();

const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = theme;
};

const persistTheme = (theme: Theme) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch (error) {
    // Don't block the UX, but do leave a breadcrumb — quota exceeded or a
    // corporate policy blocking writes is indistinguishable from Safari ITP
    // without it, and the toggle silently forgetting on reload is worse
    // than a console line.
    console.warn('Failed to persist theme preference', error);
  }
};

export const useColorScheme = () => {
  // Server/prerender path renders a stable default so hydration doesn't mismatch
  // the `data-theme` the inline bootstrap in index.html already resolved before
  // first paint. Reconcile to the real value on mount.
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = readInitialTheme();
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  // Only an explicit toggle persists. Writing on mount would latch whatever the
  // OS happened to report on the first visit, after which the stored value wins
  // forever and the system preference is never consulted again.
  const toggle = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      persistTheme(next);
      return next;
    });
  };

  // Follow the OS while the user has expressed no preference of their own.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const query = window.matchMedia(LIGHT_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      if (readStoredTheme() !== null) return;
      const next: Theme = event.matches ? 'light' : 'dark';
      setTheme(next);
      applyTheme(next);
    };

    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return { theme, mounted, toggle };
};
