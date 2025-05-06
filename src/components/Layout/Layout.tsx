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

  const themeContext = useThemeContext();
  const drawerWidth = themeContext.theme.custom.sidebarWidth;

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
    <Box sx={{ display: 'flex' }}>
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
          background: themeContext.theme.custom.mainGradient,
          color: themeContext.theme.palette.text.primary,
          transition: 'background 0.3s ease',
        }}
      >
        <Toolbar />

        {children}
      </Box>
    </Box>
  );
};
