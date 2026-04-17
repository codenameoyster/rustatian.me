import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import type { ComponentChildren } from 'preact';
import { useCallback, useState } from 'preact/hooks';
import { NavDrawer } from './components/NavDrawer';
import { TopBar } from './components/TopBar';

interface ILayoutProps {
  children: ComponentChildren;
}

export const Layout = ({ children }: ILayoutProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const theme = useTheme();
  const drawerWidth = theme.custom.sidebarWidth;

  const handleDrawerClose = useCallback(() => {
    setIsClosing(true);
    setIsMobileOpen(false);
  }, []);

  const handleDrawerTransitionEnd = useCallback(() => {
    setIsClosing(false);
  }, []);

  const handleDrawerToggle = useCallback(() => {
    if (!isClosing) {
      setIsMobileOpen(prev => !prev);
    }
  }, [isMobileOpen, isClosing]);

  return (
    <Box
      sx={{
        display: 'flex',
        bgcolor: 'background.paper',
      }}
    >
      <TopBar onDrawerToggle={handleDrawerToggle} />

      <NavDrawer
        isMobileOpen={isMobileOpen}
        onClose={handleDrawerClose}
        onTransitionEnd={handleDrawerTransitionEnd}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          flexDirection: 'column',
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          margin: { sm: '0 auto' },
          minHeight: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
          transition: 'background-color 0.3s ease',
        }}
      >
        <Toolbar />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            maxWidth: '72rem',
            margin: '0 auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};
