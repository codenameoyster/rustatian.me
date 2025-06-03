import Box from '@mui/material/Box';
import { Divider, Drawer, Typography } from '@mui/material';
import { useThemeContext } from '@/state/appContext/ThemeContext';
import { useLocation } from 'preact-iso';
import { useCallback } from 'preact/hooks';
import { Skills } from '@/components/Skills/Skills';
import { NavList } from './NavList';
import { UserInfo } from './UserInfo';

const DrawerContent = ({ onClose }: { onClose?: () => void }) => {
  const { theme } = useThemeContext();
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

        <Typography
          variant="h3"
          sx={{
            fontSize: '0.875rem',
            color: theme.palette.mode === 'dark' ? '#9ca3af' : '#6b7280',
            pt: '1.5rem',
            px: '1rem',
            mb: '0.75rem',
          }}
        >
          TECH STACK
        </Typography>

        <Skills />
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
  const { theme } = useThemeContext();
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
