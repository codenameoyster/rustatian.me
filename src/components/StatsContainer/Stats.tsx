import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { GitHubUser } from '@/api/githubRequests';

const LIGHT_SHADOW = '0 4px 12px rgba(0, 0, 0, 0.1)';
const DARK_SHADOW = '0 4px 12px rgba(255, 255, 255, 0.1)';

const StatsCard = ({ text, description }: { text?: string; description?: string }) => (
  <Box
    sx={[
      {
        background: 'background.default',
        p: 2,
        width: '100%',
        borderRadius: '0.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        boxShadow: 'none',
        '&:hover': {
          transform: 'scale(1.03)',
          boxShadow: LIGHT_SHADOW,
        },
      },
      theme =>
        theme.applyStyles('dark', {
          '&:hover': {
            transform: 'scale(1.03)',
            boxShadow: DARK_SHADOW,
          },
        }),
    ]}
  >
    {text && (
      <Typography
        sx={theme => ({
          color: theme.custom.accentColor,
          fontWeight: 'bold',
          fontSize: '1.875rem',
        })}
      >
        {text}
      </Typography>
    )}

    {description && (
      <Typography
        sx={{
          color: 'text.secondary',
          fontSize: '0.875rem',
        }}
      >
        {description}
      </Typography>
    )}
  </Box>
);

export const Stats = ({ user }: { user: GitHubUser }) => {
  const theme = useTheme();

  if (!user) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        [theme.breakpoints.down('md')]: {
          flexDirection: 'column',
        },
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <StatsCard
        text={user.public_repos ? String(user.public_repos) : 'N/A'}
        description="Public Repositories"
      />
      <StatsCard text={String(user.followers)} description="Followers" />
      <StatsCard text=">100" description="Stars" />
    </Box>
  );
};
