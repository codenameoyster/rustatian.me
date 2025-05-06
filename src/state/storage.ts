import { PaletteMode } from '@/theme/types';

export const THEME_KEY = 'themeName';

export const getThemeName = (): string | null => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return null;
  }
  return localStorage.getItem(THEME_KEY);
};

export const setThemeName = (themeName: PaletteMode) => {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return null;
  }
  localStorage.setItem(THEME_KEY, themeName);
};
