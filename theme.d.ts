import { Theme, ThemeOptions, Palette } from '@mui/material';

declare module '@mui/material' {
  interface Theme {
    palette: Palette;
    custom: {
      sidebarWidth: number;
      headerHeight: number;
      accentColor: string;
    };
  }

  interface ThemeOptions {
    palette: Palette;
    custom: {
      sidebarWidth: number;
      headerHeight: number;
      accentColor: string;
    };
  }
}
