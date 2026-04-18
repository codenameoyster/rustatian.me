import type { ComponentChildren } from 'preact';
import type { TimelineEntry } from '@/data/profile';
import styles from './TimelineItem.module.css';

interface TimelineProps {
  children: ComponentChildren;
  compact?: boolean | undefined;
}

export const Timeline = ({ children, compact }: TimelineProps) => (
  <div className={[styles.timeline, compact ? styles.compact : null].filter(Boolean).join(' ')}>
    {children}
  </div>
);

export const TimelineItem = ({ date, role, org, body, stack, current }: TimelineEntry) => (
  <div className={[styles.item, current ? styles.current : null].filter(Boolean).join(' ')}>
    <span className={styles.dot} aria-hidden />
    <div className={styles.date}>{date}</div>
    <div className={styles.role}>{role}</div>
    <div className={styles.org}>{org}</div>
    <div className={styles.body}>{body}</div>
    {stack ? <div className={styles.stack}>{stack}</div> : null}
  </div>
);
