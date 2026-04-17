import { Box, Chip } from '@mui/material';

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
    light: { bg: 'rgb(240, 253, 244)', text: '#047857' },
    dark: { bg: 'rgb(20, 40, 30)', text: '#6ee7b7' },
  },
];

const glowFromBg = (bg: string): string =>
  bg.startsWith('rgb(') ? bg.replace('rgb', 'rgba').replace(')', ', 0.6)') : `rgba(${bg}, 0.6)`;

export const Skills = () => (
  <Box
    sx={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
    }}
  >
    {technologies.map(tech => {
      const lightGlow = glowFromBg(tech.light.bg);
      const darkGlow = glowFromBg(tech.dark.bg);

      return (
        <Chip
          key={tech.label}
          label={tech.label}
          size="small"
          title={tech.label}
          sx={[
            {
              backgroundColor: tech.light.bg,
              color: tech.light.text,
              fontWeight: 500,
              px: 0.5,
              py: 0.25,
              borderRadius: '0.25rem',
              transition: 'all 0.3s ease',
              boxShadow: 'none',
              cursor: 'default',
              '&:hover': {
                backgroundColor: tech.light.bg,
                boxShadow: `0 0 0.5rem 0.125rem ${lightGlow}, 0 0.25rem 0.75rem 0.125rem ${lightGlow}`,
                transform: 'translateY(-0.063rem)',
              },
            },
            theme =>
              theme.applyStyles('dark', {
                backgroundColor: tech.dark.bg,
                color: tech.dark.text,
                '&:hover': {
                  backgroundColor: tech.dark.bg,
                  boxShadow: `0 0 0.5rem 0.125rem ${darkGlow}, 0 0.25rem 0.75rem 0.125rem ${darkGlow}`,
                  transform: 'translateY(-0.063rem)',
                },
              }),
          ]}
        />
      );
    })}
  </Box>
);
