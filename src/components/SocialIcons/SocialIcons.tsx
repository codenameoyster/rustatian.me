import { Box, IconButton, Link } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import { EMAIL, GITHUB, LINKEDIN, TWITCH, YOUTUBE } from '@/constants';
import SvgIcon from '@mui/material/SvgIcon';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { useThemeContext } from '@/state/appContext/ThemeContext';
import { PaletteMode } from '@/theme/types';

const TwitchIcon = () => (
  <SvgIcon>
    <path d="M 5.3632812 2 L 2 6.6367188 L 2 20 L 7 20 L 7 23 L 10 23 L 13 20 L 17 20 L 22 15 L 22 2 L 5.3632812 2 z M 6 4 L 20 4 L 20 13 L 17 16 L 12 16 L 9 19 L 9 16 L 6 16 L 6 4 z M 11 7 L 11 12 L 13 12 L 13 7 L 11 7 z M 16 7 L 16 12 L 18 12 L 18 7 L 16 7 z" />
  </SvgIcon>
);

interface ISocialLink {
  href: string;
  icon: React.ReactElement;
  label: string;
}

const socialLinks: ISocialLink[] = [
  {
    href: GITHUB,
    icon: <GitHubIcon />,
    label: 'GitHub',
  },
  {
    href: LINKEDIN,
    icon: <LinkedInIcon />,
    label: 'LinkedIn',
  },
  {
    href: `mailto:${EMAIL}`,
    icon: <EmailIcon />,
    label: 'Email',
  },
  {
    href: TWITCH,
    icon: <TwitchIcon />,
    label: 'Twitch',
  },
  {
    href: YOUTUBE,
    icon: <YouTubeIcon />,
    label: 'YouTube',
  },
];

export const SocialIcons = () => {
  const { theme } = useThemeContext();

  const linkColor =
    theme.palette.mode === PaletteMode.DARK ? theme.palette.text.primary : '#374151';

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        mt: 2,
      }}
      role="group"
      aria-label="Social media links"
    >
      {socialLinks.map(({ href, icon, label }) => (
        <Link
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          underline="none"
          sx={{
            color: linkColor,
            ':hover': {
              color: theme.palette.action.hover,
            },
          }}
        >
          <IconButton
            sx={{
              transition: 'transform 0.2s ease',
              p: 0.5,
              color: linkColor,
              '&:hover': {
                color: theme.palette.action.hover,
                transform: 'scale(1.15)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
              },
            }}
            aria-label={label}
          >
            {icon}
          </IconButton>
        </Link>
      ))}
    </Box>
  );
};
