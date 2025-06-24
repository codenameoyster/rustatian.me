import { CircleImage } from '@/components/CircleImage/CircleImage';
import { SocialIcons } from '@/components/SocialIcons/SocialIcons';
import { useUser } from '@/state/appContext/appContext';
import { Box } from '@mui/material';
import { UserNameLink } from './UserNameLink';
import { UserLocationLink } from './UserLocationLink';
import { CircularProgress } from '@mui/material';

export const UserInfo = () => {
  const user = useUser();

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
      }}
    >
      <CircleImage sx={{ mb: 2 }} src={user?.avatar_url} altText="Avatar" priority />

      <UserNameLink />

      <UserLocationLink />

      <SocialIcons />
    </Box>
  );
};
