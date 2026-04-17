import type { CssVarsTheme } from '@mui/material/styles';

interface CustomThemeFields {
  sidebarWidth: number;
  accentColor: string;
}

declare module '@mui/material' {
  interface Theme {
    custom: CustomThemeFields;
    vars: CssVarsTheme['vars'];
  }

  interface ThemeOptions {
    custom: CustomThemeFields;
  }
}

export {};
