import type { ComponentChildren, JSX } from 'preact';

export type ButtonVariant = 'primary' | 'ghost';

interface CommonProps {
  variant?: ButtonVariant | undefined;
  children: ComponentChildren;
}

type ButtonProps = CommonProps & JSX.ButtonHTMLAttributes<HTMLButtonElement>;
type AnchorProps = CommonProps & JSX.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

const composeClass = (variant: ButtonVariant | undefined, extra?: string): string => {
  const mod = variant ? `btn--${variant}` : '';
  return ['btn', mod, extra].filter(Boolean).join(' ');
};

export const Button = ({ variant, className, children, ...rest }: ButtonProps) => (
  <button
    type="button"
    className={composeClass(variant, className as string | undefined)}
    {...rest}
  >
    {children}
  </button>
);

export const ButtonLink = ({ variant, className, children, ...rest }: AnchorProps) => (
  <a className={composeClass(variant, className as string | undefined)} {...rest}>
    {children}
  </a>
);
