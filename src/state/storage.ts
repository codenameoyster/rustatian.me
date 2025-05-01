import { PaletteMode } from "@/types/theme";

export const THEME_KEY = "themeName";

export const getThemeName = (): string | null => {
	if (typeof window === "undefined") {
		return null;
	}
	return localStorage.getItem(THEME_KEY);
};

export const setThemeName = (themeName: PaletteMode) => {
	if (typeof window === "undefined") {
		return;
	}
	localStorage.setItem(THEME_KEY, themeName);
};
