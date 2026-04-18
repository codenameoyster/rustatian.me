import { useColorScheme } from '@/hooks/useColorScheme';
import styles from './ThemeToggle.module.css';

const MoonIcon = () => <path d="M21 12.8A9 9 0 0111.2 3a7.5 7.5 0 100 18 9 9 0 009.8-8.2z" />;

const SunIcon = () => (
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </>
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
      style={{ opacity: mounted ? 1 : 0 }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden
      >
        {isDark ? <MoonIcon /> : <SunIcon />}
      </svg>
    </button>
  );
};
