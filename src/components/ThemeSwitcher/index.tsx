import { FormControlLabel, PaletteMode, Switch } from "@mui/material";


interface ThemeSwitcherOptions {
  // useOs?: boolean;
  // useDark?: boolean;
  // darkPrompt?: string;
  // osPrompt?: string;
  // tooltipText?: string;
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
          checked={themeName === "dark"}
          onChange={handleChange}
        />
      }
    />
  );
};
