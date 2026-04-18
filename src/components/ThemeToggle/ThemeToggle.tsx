import { useColorScheme } from '@/hooks/useColorScheme';
import styles from './ThemeToggle.module.css';

const SunIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
    <defs>
      <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FFD700" />
        <stop offset="100%" stop-color="#FFA500" />
      </radialGradient>
    </defs>
    <circle cx="12" cy="12" r="5" fill="url(#sunGradient)" />
    <g stroke="#FFA500" stroke-width="2" stroke-linecap="round">
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </g>
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
    <path d="M21 12.8A9 9 0 0111.2 3a7.5 7.5 0 000 18 9 9 0 009.8-8.2z" fill="#90CAF9" />
  </svg>
);

export const ThemeToggle = () => {
  const { theme, mounted, toggle } = useColorScheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <button
      type="button"
      className={styles.toggle}
      aria-label={label}
      title={label}
      onClick={toggle}
      // Avoid a flash of the wrong icon during SSR — hide on first render,
      // reveal once the theme has been reconciled on the client.
      style={{ opacity: mounted ? 1 : 0 }}
    >
      <span className={styles.iconStack}>
        <span className={`${styles.icon} ${isDark ? styles.hidden : styles.visible}`}>
          <SunIcon />
        </span>
        <span className={`${styles.icon} ${isDark ? styles.visible : styles.hidden}`}>
          <MoonIcon />
        </span>
      </span>
    </button>
  );
};
