import { Theme, ThemeOptions, Palette, TypographyVariantsOptions } from '@mui/material';

interface CustomThemeFields {
  sidebarWidth: number;
  accentColor: string;
  scrollbar: {
    track: string;
    thumb: string;
    thumbHover: string;
  };
}

declare module '@mui/material' {
  interface Theme {
    palette: Palette;
    typography: TypographyVariantsOptions;
    custom: CustomThemeFields;
  }

  interface ThemeOptions {
    palette: Palette;
    typography: TypographyVariantsOptions;
    custom: CustomThemeFields;
  }
}
