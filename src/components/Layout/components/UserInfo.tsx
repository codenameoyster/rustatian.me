import { Box, CircularProgress } from '@mui/material';
import { CircleImage } from '@/components/CircleImage/CircleImage';
import { SocialIcons } from '@/components/SocialIcons/SocialIcons';
import { useUser } from '@/state/appContext/appContext';
import { UserLocationLink } from './UserLocationLink';
import { UserNameLink } from './UserNameLink';

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
