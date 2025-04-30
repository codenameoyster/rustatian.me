import { createContext } from "preact";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useState } from 'preact/hooks';


const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: '#1976d2',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: '#90caf9',
    },
  },
});

export const ThemeContext = createContext({
  theme: lightTheme,
  toggleTheme: () => {}
});

export const ThemeProviderWrapper = ({ children }) => {
  const [theme, setTheme] = useState(darkTheme);

  const toggleTheme = () => {
    if (theme.palette.mode === "light") {
      setTheme(darkTheme);
    } else {
      setTheme(lightTheme);
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
