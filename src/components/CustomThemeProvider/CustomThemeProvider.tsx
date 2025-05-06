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
  const initialTheme: PaletteMode = useInitialTheme();

  const isDarkMode: boolean = initialTheme === PaletteMode.DARK;

  const [theme, setTheme] = useState(isDarkMode ? darkTheme : lightTheme);

  const toggleTheme: () => void = () => {
    if (theme.palette.mode === PaletteMode.LIGHT) {
      setTheme(darkTheme);
      setThemeName(PaletteMode.DARK);
    } else {
      setTheme(lightTheme);
      setThemeName(PaletteMode.LIGHT);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
