import type { ComponentChildren, JSX } from 'preact';
import styles from './Card.module.css';

interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'article' | 'section' | undefined;
  interactive?: boolean | undefined;
  flush?: boolean | undefined;
  children: ComponentChildren;
}

export const Card = ({
  as = 'div',
  interactive,
  flush,
  className,
  children,
  ...rest
}: CardProps) => {
  const Tag = as as 'div';
  const classes = [styles.card, interactive && styles.interactive, flush && styles.flush, className]
    .filter(Boolean)
    .join(' ');
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
};
