import { ThemeOptions } from "@mui/material";

export enum PaletteMode {
  LIGHT = "light",
  DARK = "dark",
}

export type ThemeContextType = {
  toggleTheme: () => void;
  theme: ThemeOptions;
};
