import type { SocialLinkDef } from '@/data/profile';
import styles from './SocialLink.module.css';

const Icons: Record<SocialLinkDef['icon'], preact.JSX.Element> = {
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.8.1-.8 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 3 1.4 3.7 1 .1-.8.4-1.4.8-1.7-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.3-3.2-.1-.3-.6-1.6.1-3.3 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 3 .1 3.3.8.8 1.3 1.9 1.3 3.2 0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0012 .5z" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.5 3h-17A1.5 1.5 0 002 4.5v15A1.5 1.5 0 003.5 21h17a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0020.5 3zM8 18H5v-9h3v9zm-1.5-10.3A1.7 1.7 0 118.2 6a1.7 1.7 0 01-1.7 1.7zM19 18h-3v-4.5c0-1.1 0-2.5-1.5-2.5S13 12.3 13 13.5V18h-3v-9h3v1.2a3.3 3.3 0 013-1.5c3.2 0 3.8 2.1 3.8 4.8V18z" />
    </svg>
  ),
  twitch: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 2l-2 5v13h6v3h4l3-3h5l5-5V2H4zm17 11l-3 3h-5l-3 3v-3H6V4h15v9zm-5-7h2v5h-2V6zm-5 0h2v5h-2V6z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23 7.1a3 3 0 00-2.1-2.1C19 4.5 12 4.5 12 4.5s-7 0-8.9.5A3 3 0 001 7.1 31 31 0 00.5 12 31 31 0 001 16.9a3 3 0 002.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 002.1-2.1 31 31 0 00.5-4.9 31 31 0 00-.5-4.9zM9.75 15.5v-7L16 12l-6.25 3.5z" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  ),
};

interface SocialLinkProps {
  link: SocialLinkDef;
}

export const SocialLink = ({ link }: SocialLinkProps) => {
  const isExternal = !link.href.startsWith('mailto:');
  const anchorProps = isExternal ? { target: '_blank' as const, rel: 'noopener noreferrer' } : {};

  return (
    <a className={styles.link} href={link.href} {...anchorProps}>
      <span className={styles.icon}>{Icons[link.icon]}</span>
      <span className={styles.text}>
        <span className={styles.label}>{link.label}</span>
        <span className={styles.handle}>{link.handle}</span>
      </span>
    </a>
  );
};
