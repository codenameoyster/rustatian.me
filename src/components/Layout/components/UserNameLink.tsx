import { GradientLink } from '@/components/GradientLink/GradientLink';
import { GITHUB_PROFILE_URL } from '@/constants';
import { useUser } from '@/state/appContext/appContext';
import { Typography } from '@mui/material';
import { useThemeContext } from '@/state/appContext/ThemeContext';

export const UserNameLink = () => {
  const user = useUser();
  const { theme } = useThemeContext();

  return (
    <GradientLink
      href={GITHUB_PROFILE_URL}
      target="_blank"
      rel="noreferrer"
      underline="none"
      color="inherit"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.5,
        '.MuiLink-root:hover &': {
          color: 'inherit',
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontSize: '1.125rem',
          textAlign: 'center',
        }}
      >
        {user?.name}
      </Typography>

      <Typography
        sx={{
          textAlign: 'center',
          fontSize: '0.875rem',
          color: theme.palette.text.secondary,
          '.MuiLink-root:hover &': {
            color: 'inherit',
          },
        }}
      >
        @{user?.login}
      </Typography>
    </GradientLink>
  );
};
