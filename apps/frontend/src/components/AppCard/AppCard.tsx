import { Card, CardContent, SxProps, useTheme } from '@mui/material';
import { ComponentChildren } from 'preact';
import { useMemo } from 'preact/hooks';

interface IAppCardProps {
  children: ComponentChildren;
  elevation?: number;
  padding?: number;
  sx?: SxProps;
}

export const AppCard = ({ children, elevation = 0, padding = 3, sx }: IAppCardProps) => {
  const theme = useTheme();

  const cardSx = useMemo(
    () => ({
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: '0.5rem',
      ...sx,
    }),
    [theme, sx],
  );

  return (
    <Card elevation={elevation} sx={cardSx}>
      <CardContent sx={{ p: padding }}>{children}</CardContent>
    </Card>
  );
};
