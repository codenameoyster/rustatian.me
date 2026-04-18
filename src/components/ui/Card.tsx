import type { ComponentChildren, JSX } from 'preact';

interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'article' | 'section' | undefined;
  flush?: boolean | undefined;
  children: ComponentChildren;
}

export const Card = ({ as = 'div', flush, className, children, ...rest }: CardProps) => {
  const Tag = as as 'div';
  const classes = ['card', flush && 'card--flush', className as string | undefined]
    .filter(Boolean)
    .join(' ');
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
};
