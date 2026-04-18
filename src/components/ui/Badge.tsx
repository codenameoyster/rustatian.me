import type { ComponentChildren } from 'preact';
import styles from './Badge.module.css';

export type BadgeVariant = 'go' | 'rust' | 'python' | 'ai' | 'aws' | 'magenta' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant | undefined;
  children: ComponentChildren;
}

export const Badge = ({ variant = 'neutral', children }: BadgeProps) => {
  const variantClass = styles[variant];
  const className = [styles.badge, variantClass].filter(Boolean).join(' ');
  return <span className={className}>{children}</span>;
};
