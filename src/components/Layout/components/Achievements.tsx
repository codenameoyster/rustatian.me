import { CustomTooltip } from '@/components/CustomTooltip/CustomTooltip';
import { Box, Typography, Avatar } from '@mui/material';

interface IAchievementItem {
  imagePath: string;
  description: string;
  label: string;
  tier?: number;
}

const achievementList: IAchievementItem[] = [
  {
    imagePath: '/achievements/pair-extraordinaire.png',
    label: 'Pair Extraordinaire',
    description: 'User coauthored commits on merged pull requests.',
    tier: 3,
  },
  {
    imagePath: '/achievements/galaxy-brain.png',
    label: 'Galaxy Brain',
    description: 'User answered discussions.',
    tier: 4,
  },
  {
    imagePath: '/achievements/pull-shark.png',
    label: 'Pull Shark',
    description: 'User opened pull requests that have been merged.',
    tier: 4,
  },
  {
    imagePath: '/achievements/public-sponsor.png',
    label: 'Public Sponsor',
    description: 'User has sponsored 5 organizations or users.',
  },
  {
    imagePath: '/achievements/yolo.png',
    label: 'YOLO',
    description: 'You want it? You merge it.',
  },
  {
    imagePath: '/achievements/quickdraw.png',
    label: 'Quickdraw',
    description: 'Gitty up!',
  },
  {
    imagePath: '/achievements/starstruck.png',
    label: 'Starstruck',
    description: 'User created a repository that has many stars.',
  },
  {
    imagePath: '/achievements/arctic-code-vault.png',
    label: 'Arctic Code Vault Contributor',
    description:
      'User contributed code to several repositories in the 2020 GitHub Archive Program.',
  },
];

const tierColors: Record<number, string> = {
  1: '#d4af37',
  2: '#f9bfa7',
  3: '#e1e4e4',
  4: '#fae57e',
};

export const Achievements = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        justifyContent: 'flex-start',
      }}
    >
      {achievementList.map(achievement => (
        <CustomTooltip
          key={achievement.label}
          arrow
          placement="top"
          title={
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {achievement.label}
              </Typography>
              <Typography
                variant="body2"
                fontSize="0.7rem"
                sx={theme => ({
                  color: theme.palette.mode === 'dark' ? '#e6edf3' : '#f3f4f6',
                })}
              >
                {achievement.description}
              </Typography>
            </Box>
          }
        >
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: 64,
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.2)',
                zIndex: 5,
              },
            }}
          >
            <Avatar
              src={achievement.imagePath}
              alt={achievement.label}
              sx={{
                width: 64,
                height: 64,
              }}
            />
            {achievement.tier && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 4,
                  right: -8,
                  backgroundColor: tierColors[achievement.tier] || '#999',
                  color: '#010409',
                  px: '0.5rem',
                  py: 0.25,
                  fontSize: '0.625rem',
                  fontWeight: 'bold',
                  borderRadius: '0.75rem',
                  boxShadow: 1,
                  whiteSpace: 'nowrap',
                  zIndex: 2,
                }}
              >
                x{achievement.tier}
              </Box>
            )}
          </Box>
        </CustomTooltip>
      ))}
    </Box>
  );
};
