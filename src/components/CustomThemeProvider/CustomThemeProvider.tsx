
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { useState } from 'preact/hooks';
import { THEME_KEY } from "@state/storage";
import { useInitialTheme } from "@hooks/theme/useInitialTheme";
import { ThemeContext } from '@state/appContext/ThemeContext';
import { PaletteMode } from '@/types/theme'; 
import { FunctionComponent, ComponentChildren } from 'preact';

const lightTheme = createTheme({
  palette: {
    mode: PaletteMode.LIGHT,
  },
});

const darkTheme = createTheme({
  palette: {
    mode: PaletteMode.DARK,
  },
});

interface CustomThemeProviderProps {
  children: ComponentChildren,
};

export const CustomThemeProvider = ({ children }: CustomThemeProviderProps) => {
  const initialTheme = useInitialTheme();

  const isDarkMode = initialTheme === PaletteMode.DARK;

  const [theme, setTheme] = useState(isDarkMode ? darkTheme : lightTheme);

  const toggleTheme = () => {
    if (theme.palette.mode === PaletteMode.LIGHT) {
      setTheme(darkTheme);
      localStorage.setItem(THEME_KEY, PaletteMode.DARK);
    } else {
      setTheme(lightTheme);
      localStorage.setItem(THEME_KEY, PaletteMode.LIGHT);
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
