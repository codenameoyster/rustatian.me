import type { ComponentChildren } from 'preact';
import styles from './Badge.module.css';

export type BadgeVariant = 'go' | 'rust' | 'python' | 'ai' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant | undefined;
  children: ComponentChildren;
}

const LANG_TO_VARIANT: Record<string, BadgeVariant> = {
  go: 'go',
  rust: 'rust',
  python: 'python',
  c: 'rust',
  'c++': 'rust',
  javascript: 'python',
  typescript: 'python',
  shell: 'neutral',
  html: 'neutral',
  css: 'neutral',
  dockerfile: 'neutral',
};

export const variantForLanguage = (lang: string | null | undefined): BadgeVariant => {
  if (!lang) return 'neutral';
  return LANG_TO_VARIANT[lang.toLowerCase()] ?? 'neutral';
};

export const Badge = ({ variant = 'neutral', children }: BadgeProps) => (
  <span className={`${styles.badge} ${styles[variant]}`}>{children}</span>
);
