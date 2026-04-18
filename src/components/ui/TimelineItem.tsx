import type { TimelineEntry } from '@/data/profile';
import { Badge, variantForLanguage } from './Badge';
import styles from './TimelineItem.module.css';

export const TimelineItem = ({ period, role, org, summary, tags }: TimelineEntry) => (
  <li className={styles.item}>
    <span className={styles.marker} aria-hidden />
    <span className={styles.period}>{period}</span>
    <h3 className={styles.role}>{role}</h3>
    <span className={styles.org}>{org}</span>
    <p className={styles.summary}>{summary}</p>
    {tags && tags.length > 0 ? (
      <div className={styles.tags}>
        {tags.map(tag => (
          <Badge key={tag} variant={variantForLanguage(tag)}>
            {tag}
          </Badge>
        ))}
      </div>
    ) : null}
  </li>
);
