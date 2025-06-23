import { useThemeContext } from '@/state/appContext/ThemeContext';
import { GlobalStyles } from '@mui/material';

export const CustomScrollbarStyles = () => {
  const { theme } = useThemeContext();

  return (
    <GlobalStyles
      styles={{
        '*::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: theme.custom.scrollbar.thumb,
          borderRadius: '4px',
        },
        '*::-webkit-scrollbar-thumb:hover': {
          backgroundColor: theme.custom.scrollbar.thumbHover,
        },
        '*::-webkit-scrollbar-track': {
          backgroundColor: theme.custom.scrollbar.track,
        },
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: `${theme.custom.scrollbar.thumb} ${theme.custom.scrollbar.track}`,
        },
      }}
    />
  );
};
