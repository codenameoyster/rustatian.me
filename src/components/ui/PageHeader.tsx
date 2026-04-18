import type { ComponentChildren } from 'preact';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  eyebrow: string;
  title: ComponentChildren;
  lead?: ComponentChildren | undefined;
}

export const PageHeader = ({ eyebrow, title, lead }: PageHeaderProps) => (
  <header className={styles.header}>
    <div className="container">
      <div className={styles.eyebrow}>
        <span className="dot" aria-hidden />
        {eyebrow}
      </div>
      <h1 className={styles.title}>{title}</h1>
      {lead ? <p className={styles.lead}>{lead}</p> : null}
    </div>
  </header>
);
