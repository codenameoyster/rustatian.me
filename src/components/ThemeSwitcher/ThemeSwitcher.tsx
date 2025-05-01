import { PaletteMode } from "@/types/theme";
import { FormControlLabel, Switch } from "@mui/material";


interface ThemeSwitcherOptions {
  themeToggler: () => void;
  themeName: PaletteMode;
}

export const ThemeSwitcher = ({ themeName, themeToggler }: ThemeSwitcherOptions) => {
  const handleChange = () => {
    themeToggler();
  };

  return (
    <FormControlLabel
      labelPlacement="end"
      label="Dark Mode"
      control={
        <Switch
          checked={themeName === PaletteMode.DARK}
          onChange={handleChange}
        />
      }
    />
  );
};
