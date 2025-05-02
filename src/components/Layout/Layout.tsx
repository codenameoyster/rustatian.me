import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { ComponentChildren } from 'preact';
import { DRAWER_WIDTH } from '@/constants';
import { useCallback, useState } from 'preact/hooks';
import { NavDrawer } from './components/NavDrawer';
import { TopBar } from './components/TopBar';

interface ILayoutProps {
  children: ComponentChildren,
};

export const Layout = ({ children }: ILayoutProps) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const handleDrawerClose = useCallback(() => {
    setIsClosing(true);
    setIsMobileOpen(false);
  }, []);

  const handleDrawerTransitionEnd = useCallback(() => {
    setIsClosing(false);
  }, []);

  const handleDrawerToggle = useCallback(() => {
    if (!isClosing) {
      setIsMobileOpen(!isMobileOpen);
    }
  }, [isMobileOpen, isClosing]);

  return (
    <Box sx={{ display: 'flex' }}>
      <TopBar
        onDrawerToggle={handleDrawerToggle}
      />

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
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` }
        }}
      >
        <Toolbar />

        {children}
      </Box>
    </ Box>
  );
}
