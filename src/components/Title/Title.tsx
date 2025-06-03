import { Typography } from '@mui/material';
import type { TypographyProps } from '@mui/material';
import { ComponentChildren } from 'preact';

interface ITitleProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: ComponentChildren;
  className?: string;
  mb?: number;
  align?: TypographyProps['align'];
  color?: TypographyProps['color'];
}

export const Title = ({
  variant = 'h2',
  children,
  className,
  mb = 4,
  align = 'inherit',
  color = 'textPrimary',
}: ITitleProps) => {
  return (
    <Typography
      component={variant}
      variant={variant}
      align={align}
      color={color}
      className={className}
      sx={{
        pl: 2,
        borderLeft: 4,
        borderColor: '#2ea043',
        mb: mb,
      }}
    >
      {children}
    </Typography>
  );
};
