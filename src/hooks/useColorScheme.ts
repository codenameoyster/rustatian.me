import { useEffect, useState } from 'preact/hooks';

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'rustatian-v2-theme';

const readInitialTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* storage access blocked (e.g. Safari strict-private) — fall through */
  }
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = theme;
};

export const useColorScheme = () => {
  // Server/prerender path renders a stable default so hydration doesn't
  // mismatch the <html data-theme="dark"> we set at request time.
  // Reconcile to the persisted/system value on mount.
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = readInitialTheme();
    setTheme(initial);
    applyTheme(initial);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyTheme(theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      // Don't block the UX, but do leave a breadcrumb — quota exceeded or a
      // corporate policy blocking writes is indistinguishable from Safari ITP
      // without it, and the toggle silently forgetting on reload is worse
      // than a console line.
      console.warn('Failed to persist theme preference', error);
    }
  }, [mounted, theme]);

  const toggle = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  return { theme, mounted, toggle };
};
