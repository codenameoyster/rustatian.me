import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/system';
import { useMemo, useState } from 'preact/hooks';

interface ICircleImageProps {
  sx?: SxProps<Theme>;
  src: string;
  altText?: string;
  priority?: boolean;
}

export const CircleImage = ({ sx, src, altText, priority = false }: ICircleImageProps) => {
  const theme = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);

  const sxBase: SxProps<Theme> = useMemo(
    () => ({
      width: 100,
      height: 100,
      borderRadius: '50%',
      objectFit: 'cover',
      border: '2px solid',
      borderColor: 'divider',
      transition: 'box-shadow 0.4s ease',
      ...(isLoaded && {
        '&:hover': {
          animation: 'colorCycleShadow 2s infinite ease-in-out',
        },
        '@keyframes colorCycleShadow': {
          '0%': {
            boxShadow: `0 0 10px ${theme.vars.palette.primary.main}`,
          },
          '33%': {
            boxShadow: `0 0 10px ${theme.vars.palette.secondary.main}`,
          },
          '66%': {
            boxShadow: `0 0 10px ${theme.vars.palette.error.main}`,
          },
          '100%': {
            boxShadow: `0 0 10px ${theme.vars.palette.primary.main}`,
          },
        },
      }),
    }),
    [
      theme.vars.palette.primary.main,
      theme.vars.palette.secondary.main,
      theme.vars.palette.error.main,
      isLoaded,
    ],
  );

  const combinedSx = { ...sxBase, ...sx };

  return (
    <Box
      className="mb-2"
      component="img"
      src={src}
      alt={altText}
      sx={combinedSx}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchpriority={priority ? 'high' : undefined}
      onLoad={() => setIsLoaded(true)}
    />
  );
};
