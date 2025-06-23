import { useThemeContext } from '@/state/appContext/ThemeContext';
import { Box, Chip, SxProps, Theme } from '@mui/material';

interface IColorVariant {
  bg: string;
  text: string;
}

interface ILanguageBadge {
  label: string;
  light: IColorVariant;
  dark: IColorVariant;
}

const technologies: ILanguageBadge[] = [
  {
    label: 'Go',
    light: { bg: 'rgb(224, 247, 255)', text: '#00ADD8' },
    dark: { bg: 'rgb(0, 73, 92)', text: '#76e4f7' },
  },
  {
    label: 'Rust',
    light: { bg: 'rgb(255, 243, 236)', text: '#92400e' },
    dark: { bg: 'rgb(60, 37, 26)', text: '#fcd6b0' },
  },
  {
    label: 'Python',
    light: { bg: 'rgb(225, 235, 247)', text: '#1e3a8a' },
    dark: { bg: 'rgb(35, 48, 65)', text: '#93c5fd' },
  },
  {
    label: 'AI',
    light: { bg: 'rgb(225, 235, 247)', text: '#8a1e1e' },
    dark: { bg: 'rgb(35, 65, 60)', text: '#93c5fd' },
  },
];

export const Skills = () => {
  const { theme } = useThemeContext();

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}
    >
      {technologies.map(tech => {
        const { bg, text } = tech[theme.palette.mode];
        const glow = bg.startsWith('rgb(')
          ? bg.replace('rgb', 'rgba').replace(')', ', 0.6)')
          : `rgba(${bg}, 0.6)`;

        const sxStyles: SxProps<Theme> = {
          backgroundColor: bg,
          color: text,
          fontWeight: 500,
          px: 0.5,
          py: 0.25,
          borderRadius: '0.25rem',
          transition: 'all 0.3s ease',
          boxShadow: 'none',
          cursor: 'default',
          '&:hover': {
            backgroundColor: bg,
            boxShadow: `
              0 0 0.5rem 0.125rem ${glow},
              0 0.25rem 0.75rem 0.125rem ${glow}
            `,
            transform: 'translateY(-0.063rem)',
          },
        };

        return (
          <Chip key={tech.label} label={tech.label} size="small" sx={sxStyles} title={tech.label} />
        );
      })}
    </Box>
  );
};
