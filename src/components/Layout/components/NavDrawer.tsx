import { Divider, Drawer, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { useCallback } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { Skills } from '@/components/Skills/Skills';
import { Achievements } from './Achievements';
import { NavList } from './NavList';
import { UserInfo } from './UserInfo';

const DrawerSubtitle = ({ text }: { text: string }) => (
  <Typography
    variant="h3"
    sx={[
      {
        fontSize: '0.875rem',
        color: '#6b7280',
        pt: '1.5rem',
        px: '1rem',
        mb: '0.75rem',
      },
      theme => theme.applyStyles('dark', { color: '#9ca3af' }),
    ]}
  >
    {text}
  </Typography>
);

const DrawerContent = ({ onClose }: { onClose?: () => void }) => {
  const { route } = useLocation();

  const handleListItemClick = useCallback(
    (to: string) => {
      route(to);

      if (onClose) {
        onClose();
      }
    },
    [route],
  );

  return (
    <div>
      <UserInfo />

      <Divider />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          p: '1.5rem 1rem',
        }}
      >
        <NavList onClick={handleListItemClick} />

        <Divider />

        <DrawerSubtitle text="TECH STACK" />

        <Box sx={{ pb: '2rem' }}>
          <Skills />
        </Box>

        <Divider />

        <DrawerSubtitle text="ACHIEVEMENTS" />

        <Achievements />
      </Box>
    </div>
  );
};

interface INavDrawerProps {
  isMobileOpen: boolean;
  onClose: () => void;
  onTransitionEnd: () => void;
}

export const NavDrawer = ({ isMobileOpen, onClose, onTransitionEnd }: INavDrawerProps) => {
  const theme = useTheme();
  const drawerWidth = theme.custom.sidebarWidth;

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="Main Navigation"
      role="navigation"
    >
      <Drawer
        variant="temporary"
        open={isMobileOpen}
        onTransitionEnd={onTransitionEnd}
        onClose={onClose}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        slotProps={{
          root: {
            keepMounted: true,
          },
        }}
      >
        <DrawerContent onClose={onClose} />
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
        open
      >
        <DrawerContent />
      </Drawer>
    </Box>
  );
};
