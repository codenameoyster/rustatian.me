import { Theme, ThemeOptions, Palette, TypographyVariantsOptions } from '@mui/material';

declare module '@mui/material' {
  interface Theme {
    palette: Palette;
    typography: TypographyVariantsOptions;
    custom: {
      sidebarWidth: number;
      headerHeight: number;
      accentColor: string;
      scrollbar: {
        track: string,
        thumb: string,
        thumbHover: string,
      },
    };
  }

  interface ThemeOptions {
    palette: Palette;
    typography: TypographyVariantsOptions;
    custom: {
      sidebarWidth: number;
      headerHeight: number;
      accentColor: string;
      scrollbar: {
        track: string,
        thumb: string,
        thumbHover: string,
      },
    };
  }
}
