import { Box, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'preact/hooks';

interface IDelayedSpinnerProps {
  delay?: number;
}

export const DelayedSpinner = ({ delay = 300 }: IDelayedSpinnerProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (!show) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100vw',
        height: '100vh',
      }}
    >
      <CircularProgress />
    </Box>
  );
};
