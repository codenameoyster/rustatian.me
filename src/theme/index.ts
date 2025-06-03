import { createTheme } from '@mui/material';
import { PaletteMode } from './types';

const typography = {
  fontFamily: '"Monaspace Neon", "SFMono-Regular", Menlo, monospace',
  fontSize: 14,
  h1: { fontSize: '2rem', fontWeight: 600 },
  h2: { fontSize: '1.75rem', fontWeight: 600 },
  h3: { fontSize: '1.5rem', fontWeight: 600 },
  body1: { fontSize: '1rem' },
  body2: { fontSize: '0.875rem' },
  caption: { fontSize: '0.75rem' },
};

const shape = {
  borderRadius: 8,
};

export const lightTheme = createTheme({
  palette: {
    mode: PaletteMode.LIGHT,
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
    primary: {
      main: '#0969da',
    },
    text: {
      primary: '#000000',
      secondary: '#4b5563',
    },
    divider: '#e5e7eb',
    action: {
      hover: '#3b82f6',
      selected: '#cdd9e5',
      hoverOpacity: 0.08,
      selectedOpacity: 0.16,
    },
  },
  typography,
  shape,
  custom: {
    sidebarWidth: 280,
    headerHeight: 64,
    accentColor: '#2ea043',
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: PaletteMode.DARK,
    background: {
      default: '#0d1117',
      paper: '#161b22',
    },
    primary: {
      main: '#2f81f7',
    },
    text: {
      primary: '#c9d1d9',
      secondary: '#9ca3af',
    },
    divider: '#30363d',
    action: {
      hover: '#60a5fa',
      selected: '#21262d',
      hoverOpacity: 0.08,
      selectedOpacity: 0.16,
    },
  },
  typography,
  shape,
  custom: {
    sidebarWidth: 280,
    headerHeight: 64,
    accentColor: '#2ea043',
  },
});
