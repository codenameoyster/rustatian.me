import { Card, CardContent, type SxProps } from '@mui/material';
import type { ComponentChildren } from 'preact';
import { useMemo } from 'preact/hooks';

interface IAppCardProps {
  children: ComponentChildren;
  elevation?: number;
  padding?: number;
  sx?: SxProps;
}

export const AppCard = ({ children, elevation = 0, padding = 3, sx }: IAppCardProps) => {
  const cardSx = useMemo(
    () => ({
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: '0.5rem',
      ...sx,
    }),
    [sx],
  );

  return (
    <Card elevation={elevation} sx={cardSx}>
      <CardContent sx={{ p: padding }}>{children}</CardContent>
    </Card>
  );
};
