import { GradientLink } from '@/components/GradientLink/GradientLink';
import IconPlace from '@mui/icons-material/Place';
import { useUser } from '@/state/appContext/appContext';
import { Typography } from '@mui/material';
import { useThemeContext } from '@/state/appContext/ThemeContext';
import { useCallback } from 'preact/hooks';

function makeGoogleMapsUrl(key: string, value: string): string {
  const urlObj = new URL('https://www.google.com/maps/search/?api=1');
  urlObj.searchParams.append(key, value);
  return urlObj.toString();
}

export const UserLocationLink = () => {
  const user = useUser();
  const { theme } = useThemeContext();

  const locationUrl = useCallback(() => {
    if (user?.location) {
      return makeGoogleMapsUrl('query', user?.location);
    }
    return '';
  }, [user?.location]);

  return (
    <>
      {user?.location && (
        <GradientLink
          href={locationUrl()}
          target="_blank"
          rel="noreferrer"
          underline="none"
          color="inherit"
        >
          <Typography
            sx={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.875rem',
              color: theme.palette.text.secondary,
              '.MuiLink-root:hover &': {
                color: 'inherit',
              },
              mt: 1,
            }}
          >
            <IconPlace sx={{ maxHeight: '1rem' }} /> {user?.location}
          </Typography>
        </GradientLink>
      )}
    </>
  );
};
