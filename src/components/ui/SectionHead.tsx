import styles from './SectionHead.module.css';

interface SectionHeadProps {
  eyebrow?: string | undefined;
  title: string;
  description?: string | undefined;
  id?: string | undefined;
}

export const SectionHead = ({ eyebrow, title, description, id }: SectionHeadProps) => (
  <header className={styles.section} id={id}>
    {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
    <h2 className={styles.title}>{title}</h2>
    {description ? <p className={styles.description}>{description}</p> : null}
  </header>
);
