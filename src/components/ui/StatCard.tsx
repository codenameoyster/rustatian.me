import styles from './StatCard.module.css';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string | undefined;
}

const formatValue = (value: string | number): string => {
  if (typeof value === 'string') return value;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
};

export const StatCard = ({ label, value, sub }: StatCardProps) => (
  <div className={styles.statCard}>
    <span className={styles.label}>{label}</span>
    <span className={styles.value}>{formatValue(value)}</span>
    {sub ? <span className={styles.sub}>{sub}</span> : null}
  </div>
);
