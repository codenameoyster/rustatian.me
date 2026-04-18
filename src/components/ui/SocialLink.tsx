import type { JSX } from 'preact';
import type { SocialIcon, SocialItem } from '@/data/profile';
import styles from './SocialLink.module.css';

// Factory functions (not pre-constructed vnodes) so every render emits a fresh
// element — avoids reusing the same vnode identity across mount points.
export const Icons: Record<SocialIcon, () => JSX.Element> = {
  github: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.98 5.26.98 11.53c0 4.86 3.15 8.98 7.52 10.44.55.1.75-.24.75-.52 0-.26-.01-1.13-.02-2.04-3.06.66-3.71-1.3-3.71-1.3-.5-1.27-1.23-1.6-1.23-1.6-1-.68.08-.67.08-.67 1.11.08 1.69 1.14 1.69 1.14.98 1.68 2.58 1.2 3.22.92.1-.71.39-1.2.7-1.48-2.44-.28-5-1.22-5-5.43 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.92 0 0 .92-.29 3.03 1.13a10.54 10.54 0 0 1 5.52 0c2.11-1.42 3.03-1.13 3.03-1.13.6 1.52.22 2.64.11 2.92.7.77 1.13 1.75 1.13 2.95 0 4.22-2.57 5.15-5.01 5.42.4.34.75 1.02.75 2.06 0 1.49-.01 2.69-.01 3.06 0 .29.2.63.76.52A11.04 11.04 0 0 0 23 11.53C23 5.26 18.27.5 12 .5z" />
    </svg>
  ),
  linkedin: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5A2.5 2.5 0 0 1 7.5 6a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1 2.48-2.5zM3 8.98h5V21H3zM10 8.98h4.79v1.64h.07c.67-1.27 2.31-2.61 4.75-2.61 5.08 0 6.02 3.34 6.02 7.69V21h-5v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94V21H10z" />
    </svg>
  ),
  twitch: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4 3l-2 4v14h5v3h3l3-3h4l6-6V3H4zm18 11l-4 4h-4l-3 3v-3H7V5h15v9zM11 7h2v6h-2zm6 0h2v6h-2z" />
    </svg>
  ),
  youtube: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23 7.2a3 3 0 0 0-2.1-2.12C19 4.55 12 4.55 12 4.55s-7 0-8.9.53A3 3 0 0 0 1 7.2C.47 9.1.47 12 .47 12s0 2.9.53 4.8A3 3 0 0 0 3.1 18.92C5 19.45 12 19.45 12 19.45s7 0 8.9-.53A3 3 0 0 0 23 16.8c.53-1.9.53-4.8.53-4.8s0-2.9-.53-4.8zM9.75 15.5v-7l6 3.5-6 3.5z" />
    </svg>
  ),
  email: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),
};

interface CcRowProps {
  label: string;
  value: string;
  href?: string | undefined;
}

export const CcRow = ({ label, value, href }: CcRowProps) => {
  if (href) {
    const external = !href.startsWith('mailto:');
    return (
      <a
        className={styles.row}
        href={href}
        {...(external ? { target: '_blank' as const, rel: 'noopener noreferrer' } : {})}
      >
        <span className={styles.key}>{label}</span>
        <span className={styles.val}>{value}</span>
        <span className={styles.arrow}>→</span>
      </a>
    );
  }
  return (
    <div className={`${styles.row} ${styles.rowStatic}`}>
      <span className={styles.key}>{label}</span>
      <span className={styles.val}>{value}</span>
      <span className={styles.arrow} aria-hidden />
    </div>
  );
};

interface CcLinkProps {
  social: SocialItem;
}

export const CcLink = ({ social }: CcLinkProps) => {
  const external = !social.href.startsWith('mailto:');
  return (
    <a
      className={styles.link}
      href={social.href}
      aria-label={social.label}
      {...(external ? { target: '_blank' as const, rel: 'noopener noreferrer' } : {})}
    >
      <span className={styles.linkIco}>{Icons[social.icon]()}</span>
      <span className={styles.linkLabel}>{social.label.toLowerCase()}</span>
      <span className={styles.linkArrow}>↗</span>
    </a>
  );
};
