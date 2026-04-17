import { useInitialTheme } from '@hooks/theme/useInitialTheme';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeContext } from '@state/appContext/ThemeContext';
import { setThemeName } from '@state/storage';
import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';
import { darkTheme, lightTheme } from '@/theme';
import { PaletteMode } from '@/theme/types';

interface ICustomThemeProviderProps {
  children: ComponentChildren;
}

export const CustomThemeProvider = ({ children }: ICustomThemeProviderProps) => {
  const initialTheme = useInitialTheme();
  const [theme, setTheme] = useState(initialTheme === PaletteMode.DARK ? darkTheme : lightTheme);

  const toggleTheme = () => {
    const isLight = theme.palette.mode === PaletteMode.LIGHT;
    setTheme(isLight ? darkTheme : lightTheme);
    setThemeName(isLight ? PaletteMode.DARK : PaletteMode.LIGHT);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
