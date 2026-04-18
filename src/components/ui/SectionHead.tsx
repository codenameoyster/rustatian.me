import type { ComponentChildren } from 'preact';
import styles from './SectionHead.module.css';

interface SectionHeadProps {
  title: string;
  meta?: ComponentChildren | undefined;
  id?: string | undefined;
}

export const SectionHead = ({ title, meta, id }: SectionHeadProps) => (
  <div className={styles.head}>
    <h2 className={styles.title} {...(id ? { id } : {})}>
      {title}
    </h2>
    {meta != null ? <span className={styles.meta}>{meta}</span> : null}
  </div>
);
