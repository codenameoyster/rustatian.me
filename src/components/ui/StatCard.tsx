import type { StatAccent } from '@/data/profile';
import styles from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: string | number;
  accent?: StatAccent | undefined;
  delta?: string | undefined;
}

export const formatValue = (value: string | number): string => {
  if (typeof value === 'string') return value;
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
  return String(value);
};

const ACCENT_CLASS: Record<StatAccent, string | undefined> = {
  green: undefined,
  blue: styles.blue,
  yellow: styles.yellow,
  magenta: styles.magenta,
};

export const StatCard = ({ label, value, accent = 'green', delta }: StatCardProps) => {
  const className = [styles.stat, ACCENT_CLASS[accent]].filter(Boolean).join(' ');
  return (
    <div className={className}>
      <div className={styles.accent} aria-hidden />
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{formatValue(value)}</div>
      <div className={styles.delta}>{delta ? <b>{delta}</b> : '—'}</div>
    </div>
  );
};
