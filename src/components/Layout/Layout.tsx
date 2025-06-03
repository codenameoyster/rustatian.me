import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { ComponentChildren } from 'preact';
import { useCallback, useState } from 'preact/hooks';
import { NavDrawer } from './components/NavDrawer';
import { TopBar } from './components/TopBar';
import { useThemeContext } from '@/state/appContext/ThemeContext';

interface ILayoutProps {
  children: ComponentChildren;
}

export const Layout = ({ children }: ILayoutProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const { theme } = useThemeContext();
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
        background: theme.palette.background.paper,
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
          background: theme.palette.background.default,
          color: theme.palette.text.primary,
          transition: 'background 0.3s ease',
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
