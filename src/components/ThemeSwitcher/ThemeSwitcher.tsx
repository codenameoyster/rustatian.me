import { useThemeContext } from '@/state/appContext/ThemeContext';
import { PaletteMode } from '@/theme/types';
import { IconButton, Box } from '@mui/material';

const SvgIconButton = () => {
  const { theme, toggleTheme } = useThemeContext();
  const isDarkMode = theme.palette.mode === PaletteMode.DARK;

  return (
    <IconButton
      onClick={toggleTheme}
      aria-label="Toggle theme"
      sx={{
        position: 'relative',
        width: 24,
        height: 24,
        padding: 1,
        borderRadius: '50%',
        overflow: 'hidden',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
      }}
    >
      <Box
        component="span"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: isDarkMode ? 0 : 1,
          transform: isDarkMode ? 'translateY(-10px)' : 'translateY(0)',
          transition: 'all 0.4s ease',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <defs>
            <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#FFD700" />
              <stop offset="100%" stop-color="#FFA500" />
            </radialGradient>
          </defs>
          <circle cx="12" cy="12" r="5" fill="url(#sunGradient)" />
          <g stroke="#FFA500" stroke-width="2" stroke-linecap="round">
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </g>
        </svg>
      </Box>

      <Box
        component="span"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: isDarkMode ? 1 : 0,
          transform: isDarkMode ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.4s ease',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path d="M21 12.8A9 9 0 0111.2 3a7.5 7.5 0 000 18 9 9 0 009.8-8.2z" fill="#90CAF9" />
        </svg>
      </Box>
    </IconButton>
  );
};

export const ThemeSwitcher = () => {
  return <SvgIconButton />;
};
