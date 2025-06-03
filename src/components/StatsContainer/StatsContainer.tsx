import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@api/queryKeys';
import { useSetError } from '@state/appContext/appContext';
import { useEffect } from 'preact/hooks';
import { getUser } from '@/api/githubRequests';
import { Stats } from './Stats';
import { Box, CircularProgress, Fade, Typography } from '@mui/material';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import { useThemeContext } from '@/state/appContext/ThemeContext';
import { AppCard } from '../AppCard/AppCard';

export const StatsContainer = () => {
  const { data, isLoading, isError, error, isFetched } = useQuery({
    queryKey: [queryKeys.GET_USER],
    queryFn: () => getUser(),
  });

  const { theme } = useThemeContext();
  const setError = useSetError();

  useEffect(() => {
    if (isError && error) {
      setError(error);
    } else if (isFetched && !data) {
      setError(new Error('User not received'));
    }

    if (isLoading) {
      setError(null);
    }
  }, [isError, isFetched, data, error, setError]);

  if (isLoading) {
    return (
      <Box
        sx={{
          width: '100%',
          py: 6,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data) {
    return null;
  }

  return (
    <Fade in timeout={1000}>
      <div>
        <AppCard
          sx={{
            mb: '6rem',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              display: 'flex',
              alignItems: 'center',
              columnGap: '0.75rem',
              mb: '1.5rem',
            }}
          >
            <QueryStatsIcon
              sx={{
                color: theme.custom.accentColor,
              }}
            />
            GitHub Stats
          </Typography>

          <Stats user={data} />
        </AppCard>
      </div>
    </Fade>
  );
};
