import { Link } from '@mui/material';
import { styled } from '@mui/material/styles';

export const GradientLink = styled(Link)(() => {
  return {
    position: 'relative',
    color: 'inherit',
    textDecoration: 'none',
    fontWeight: 'bold',
    padding: '0.25rem 0',
    transition: 'color 0.3s ease',

    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      bottom: 0,
      width: '100%',
      height: '0.125rem',
      background: 'linear-gradient(90deg, #3b82f6, #60a5fa, #93c5fd)',
      transform: 'scaleX(0)',
      transformOrigin: 'left',
      transition: 'transform 0.3s ease',
    },

    '&:hover': {
      color: '#60a5fa',

      '&::after': {
        transform: 'scaleX(1)',
      },
    },
  };
});
