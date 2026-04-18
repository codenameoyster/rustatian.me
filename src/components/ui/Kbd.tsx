import type { ComponentChildren } from 'preact';

interface KbdProps {
  children: ComponentChildren;
}

export const Kbd = ({ children }: KbdProps) => <span className="kbd">{children}</span>;
