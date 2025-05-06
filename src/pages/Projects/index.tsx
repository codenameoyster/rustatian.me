import { usePageMetadata } from '@/hooks/usePageMetadata';
import { Typography } from '@mui/material';

export const Projects = () => {
  usePageMetadata({ title: 'Projects' });

  return <Typography variant="h1">Projects</Typography>;
};
