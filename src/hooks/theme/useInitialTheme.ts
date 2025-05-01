import { PaletteMode } from "@/types/theme";
import { THEME_KEY } from "@state/storage";
import { useMediaQuery } from "@mui/material";

export const useInitialTheme = () => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const savedTheme = localStorage.getItem(THEME_KEY);
  const initialTheme = savedTheme === PaletteMode.DARK || savedTheme === PaletteMode.LIGHT
    ? savedTheme
    : prefersDarkMode
      ? PaletteMode.DARK
      : PaletteMode.LIGHT;

  return initialTheme;
}
