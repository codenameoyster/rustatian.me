interface DotProps {
  className?: string | undefined;
}

export const Dot = ({ className }: DotProps) => (
  <span className={['dot', className].filter(Boolean).join(' ')} aria-hidden />
);
