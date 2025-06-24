import { useThemeContext } from '@/state/appContext/ThemeContext';
import { Box } from '@mui/material';
import { useMemo, useState } from 'preact/hooks';
import { SxProps, Theme } from '@mui/system';

interface ICircleImageProps {
  sx?: SxProps<Theme>;
  src: string;
  altText?: string;
  priority?: boolean;
}

export const CircleImage = ({ sx, src, altText, priority = false }: ICircleImageProps) => {
  const { theme } = useThemeContext();
  const [isLoaded, setIsLoaded] = useState(false);

  const sxBase: SxProps<Theme> = useMemo(
    () => ({
      width: 100,
      height: 100,
      borderRadius: '50%',
      objectFit: 'cover',
      border: '2px solid',
      borderColor: theme.palette.divider,
      transition: 'box-shadow 0.4s ease',
      ...(isLoaded && {
        '&:hover': {
          animation: 'colorCycleShadow 2s infinite ease-in-out',
        },
        '@keyframes colorCycleShadow': {
          '0%': {
            boxShadow: `0 0 10px ${theme.palette.primary['main']}`,
          },
          '33%': {
            boxShadow: `0 0 10px ${theme.palette.secondary['main']}`,
          },
          '66%': {
            boxShadow: `0 0 10px ${theme.palette.error['main']}`,
          },
          '100%': {
            boxShadow: `0 0 10px ${theme.palette.primary['main']}`,
          },
        },
      }),
    }),
    [
      theme.palette.divider,
      theme.palette.primary,
      theme.palette.secondary,
      theme.palette.error,
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
