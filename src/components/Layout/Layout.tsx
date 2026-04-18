import type { ComponentChildren } from 'preact';
import { useCallback, useEffect, useState } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { ThemeToggle } from '@/components/ThemeToggle/ThemeToggle';
import { useGitHubUser } from '@/hooks/useGitHub';
import styles from './Layout.module.css';
import { NavDrawer } from './NavDrawer';

interface LayoutProps {
  children: ComponentChildren;
}

const MenuIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    aria-hidden
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

export const Layout = ({ children }: LayoutProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { path } = useLocation();

  const { data: user } = useGitHubUser();

  const handleOpen = useCallback(() => setIsDrawerOpen(true), []);
  const handleClose = useCallback(() => setIsDrawerOpen(false), []);

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [path]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = isDrawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  return (
    <div className={styles.layout}>
      <div className={`${styles.sidebar} ${isDrawerOpen ? styles.sidebarOpen : ''}`}>
        <NavDrawer user={user} isOpen={isDrawerOpen} onClose={handleClose} />
      </div>

      <div
        className={`${styles.scrim} ${isDrawerOpen ? styles.scrimOpen : ''}`}
        onClick={handleClose}
        aria-hidden
      />

      <div className={styles.main}>
        <div className={styles.topbar}>
          <button
            type="button"
            className={styles.menuButton}
            aria-label="Open navigation"
            onClick={handleOpen}
          >
            <MenuIcon />
          </button>
          <span className={styles.brandMobile}>rustatian</span>
          <ThemeToggle />
        </div>

        <main className={styles.content}>{children}</main>

        <footer className={styles.footer}>
          © {new Date().getFullYear()} Valery Piashchynski · built with Preact
        </footer>
      </div>
    </div>
  );
};
