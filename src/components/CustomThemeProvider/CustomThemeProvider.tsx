import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useState } from 'preact/hooks';
import { setThemeName } from '@state/storage';
import { useInitialTheme } from '@hooks/theme/useInitialTheme';
import { ThemeContext } from '@state/appContext/ThemeContext';
import { PaletteMode } from '@/theme/types';
import { ComponentChildren } from 'preact';
import { darkTheme, lightTheme } from '@/theme';

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
