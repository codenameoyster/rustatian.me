import { createContext } from "preact";
import { useContext } from "preact/hooks";
import { ThemeContextType } from "@/types/theme";

export const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
