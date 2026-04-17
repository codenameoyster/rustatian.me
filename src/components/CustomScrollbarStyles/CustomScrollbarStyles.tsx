import { GlobalStyles } from '@mui/material';

const LIGHT_THUMB = '#c1c1c1';
const LIGHT_THUMB_HOVER = '#a8a8a8';
const LIGHT_TRACK = '#f1f1f1';
const DARK_THUMB = '#4b5563';
const DARK_THUMB_HOVER = '#6b7280';
const DARK_TRACK = '#1f2937';

export const CustomScrollbarStyles = () => (
  <GlobalStyles
    styles={theme => ({
      '*::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '*::-webkit-scrollbar-thumb': {
        backgroundColor: LIGHT_THUMB,
        borderRadius: '4px',
        ...theme.applyStyles('dark', { backgroundColor: DARK_THUMB }),
      },
      '*::-webkit-scrollbar-thumb:hover': {
        backgroundColor: LIGHT_THUMB_HOVER,
        ...theme.applyStyles('dark', { backgroundColor: DARK_THUMB_HOVER }),
      },
      '*::-webkit-scrollbar-track': {
        backgroundColor: LIGHT_TRACK,
        ...theme.applyStyles('dark', { backgroundColor: DARK_TRACK }),
      },
      '*': {
        scrollbarWidth: 'thin',
        scrollbarColor: `${LIGHT_THUMB} ${LIGHT_TRACK}`,
        ...theme.applyStyles('dark', {
          scrollbarColor: `${DARK_THUMB} ${DARK_TRACK}`,
        }),
      },
    })}
  />
);
