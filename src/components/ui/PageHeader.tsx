import styles from './PageHeader.module.css';

interface PageHeaderProps {
  eyebrow?: string | undefined;
  title: string;
  tagline?: string | undefined;
  avatarUrl?: string | null | undefined;
  avatarAlt?: string | undefined;
}

export const PageHeader = ({ eyebrow, title, tagline, avatarUrl, avatarAlt }: PageHeaderProps) => (
  <header className={styles.header}>
    {avatarUrl ? (
      <img
        className={styles.avatar}
        src={avatarUrl}
        alt={avatarAlt ?? ''}
        width={120}
        height={120}
        loading="eager"
      />
    ) : (
      <div className={styles.avatarPlaceholder} aria-hidden>
        {title.trim().slice(0, 1).toUpperCase()}
      </div>
    )}
    <div className={styles.text}>
      {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
      <h1 className={styles.title}>{title}</h1>
      {tagline ? <p className={styles.tagline}>{tagline}</p> : null}
    </div>
  </header>
);
