import { ThemeContext } from "@/state/appContext/ThemeContext";
import { PaletteMode } from "@/types/theme";
import { FormControlLabel, Switch } from "@mui/material";
import { useCallback, useContext } from "preact/hooks";

export const ThemeSwitcher = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const handleChange = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  return (
    <FormControlLabel
      labelPlacement="end"
      label="Dark Mode"
      control={
        <Switch
          checked={theme.palette.mode === PaletteMode.DARK}
          onChange={handleChange}
        />
      }
    />
  );
};
