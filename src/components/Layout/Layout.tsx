import type { ComponentChildren } from 'preact';
import { useLocation } from 'preact-iso';
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle';
import { GITHUB } from '@/constants';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ComponentChildren;
}

const NAV_ITEMS = [
  { path: '/', num: '01', label: 'home' },
  { path: '/about', num: '02', label: 'about' },
  { path: '/contact', num: '03', label: 'contact' },
] as const;

export const Layout = ({ children }: LayoutProps) => {
  const { path } = useLocation();

  return (
    <div className={styles.layout}>
      <a href="#main" className={styles.skipLink}>
        Skip to main content
      </a>
      <nav className={styles.nav} aria-label="Primary">
        <div className={styles.inner}>
          <a href="/" className={styles.brand} aria-label="Home">
            <span className={styles.prompt}>~</span>
            <span className={styles.path}>rustatian</span>
          </a>
          <div className={styles.links}>
            {NAV_ITEMS.map(it => {
              const current = path === it.path;
              return (
                <a
                  key={it.path}
                  href={it.path}
                  className={styles.link}
                  {...(current ? { 'aria-current': 'page' as const } : {})}
                >
                  <span className={styles.linkNum}>{it.num}</span>
                  <span>{it.label}</span>
                </a>
              );
            })}
          </div>
          <div className={styles.actions}>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main id="main" className={styles.main}>
        {children}
      </main>

      <footer className={styles.footer}>
        <div className={`container ${styles.footerGrid}`}>
          <div>© {new Date().getFullYear()} rustatian · Built with care in Geist + Geist Mono</div>
          <div className={styles.footerLinks}>
            <a href="/contact" className="link">
              contact
            </a>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="link">
              github
            </a>
            <span className="muted">v2.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
