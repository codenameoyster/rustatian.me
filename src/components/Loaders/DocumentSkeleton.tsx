import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

export const DocumentSkeleton = () => (
  <Stack spacing={2} sx={{ width: '100%', p: 3 }}>
    <Skeleton 
      variant="rectangular" 
      width="60%" 
      height={40} 
      sx={{ my: 2 }}
    />
    <Skeleton variant="text" width="100%" />
    <Skeleton variant="text" width="90%" />
    <Skeleton variant="text" width="95%" />
    <Skeleton variant="text" width="100%" />
    <Skeleton variant="text" width="85%" />
    <Skeleton variant="text" width="95%" />
    <Skeleton variant="text" width="80%" />
  </Stack>
);
