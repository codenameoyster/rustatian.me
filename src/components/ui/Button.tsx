import type { ComponentChildren, JSX } from 'preact';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost';

interface CommonProps {
  variant?: Variant | undefined;
  icon?: boolean | undefined;
  children: ComponentChildren;
}

type ButtonProps = CommonProps & JSX.ButtonHTMLAttributes<HTMLButtonElement>;
type AnchorProps = CommonProps & JSX.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

const composeClass = (variant: Variant, icon: boolean | undefined, extra?: string | undefined) =>
  [styles.button, styles[variant], icon && styles.icon, extra].filter(Boolean).join(' ');

export const Button = ({
  variant = 'primary',
  icon,
  className,
  children,
  ...rest
}: ButtonProps) => (
  <button
    type="button"
    className={composeClass(variant, icon, className as string | undefined)}
    {...rest}
  >
    {children}
  </button>
);

export const ButtonLink = ({
  variant = 'primary',
  icon,
  className,
  children,
  ...rest
}: AnchorProps) => (
  <a className={composeClass(variant, icon, className as string | undefined)} {...rest}>
    {children}
  </a>
);
