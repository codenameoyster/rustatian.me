import { createTheme } from '@mui/material';
import { PaletteMode } from './types';

const typography = {
  fontFamily: '"Inter", "Arial", sans-serif',
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
      default: '#f6f8fa',
      paper: '#ffffff',
    },
    primary: {
      main: '#0969da',
    },
    text: {
      primary: '#24292f',
      secondary: '#57606a',
    },
    divider: '#d0d7de',
    action: {
      hover: '#d0d7de',
      selected: '#cdd9e5',
      hoverOpacity: 0.08,
      selectedOpacity: 0.16,
    },
  },
  typography,
  shape,
  custom: {
    headerGradient: 'rgb(255, 255, 255)',
    mainGradient: 'linear-gradient(180deg, #f6f8fa 0%, #eaeef2 100%)',
    sidebarWidth: 280,
    headerHeight: 64,
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
      secondary: '#8b949e',
    },
    divider: '#30363d',
    action: {
      hover: '#30363d',
      selected: '#21262d',
      hoverOpacity: 0.08,
      selectedOpacity: 0.16,
    },
  },
  typography,
  shape,
  custom: {
    headerGradient: 'rgb(22, 27, 34)',
    mainGradient: 'linear-gradient(180deg, #0d1117 0%, #161b22 100%)',
    sidebarWidth: 280,
    headerHeight: 64,
  },
});
