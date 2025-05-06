import { Theme, ThemeOptions } from '@mui/material';

declare module '@mui/material' {
  interface Theme {
    custom: {
      mainGradient: string;
      headerGradient: string;
      sidebarWidth: number;
      headerHeight: number;
    };
  }

  interface ThemeOptions {
    custom: {
      mainGradient: string;
      headerGradient: string;
      sidebarWidth: number;
      headerHeight: number;
    };
  }
}
