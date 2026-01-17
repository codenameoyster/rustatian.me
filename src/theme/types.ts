import { Theme } from '@mui/material';

export enum PaletteMode {
  LIGHT = 'light',
  DARK = 'dark',
}

export type ThemeContextType = {
  toggleTheme: () => void;
  theme: Theme;
};
