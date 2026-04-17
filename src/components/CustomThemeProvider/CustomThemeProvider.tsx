import { ThemeProvider } from '@mui/material/styles';
import type { ComponentChildren } from 'preact';
import { theme } from '@/theme';

interface ICustomThemeProviderProps {
  children: ComponentChildren;
}

export const CustomThemeProvider = ({ children }: ICustomThemeProviderProps) => (
  <ThemeProvider theme={theme} defaultMode="system" disableTransitionOnChange>
    {children}
  </ThemeProvider>
);
