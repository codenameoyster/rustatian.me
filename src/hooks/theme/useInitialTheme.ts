import { PaletteMode } from '@/theme/types';
import { getThemeName } from '@state/storage';
import { useMediaQuery } from '@mui/material';

export const useInitialTheme = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const savedThemeName = getThemeName();

  const initialTheme =
    savedThemeName === PaletteMode.DARK || savedThemeName === PaletteMode.LIGHT
      ? savedThemeName
      : prefersDarkMode
        ? PaletteMode.DARK
        : PaletteMode.LIGHT;

  return initialTheme;
};
