import { AppBar, Box, Drawer, IconButton, Menu, MenuItem, Toolbar, Typography, useMediaQuery } from "@mui/material";
import { useCallback, useState } from "preact/hooks";

export const Home = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const handleDrawerToggle = useCallback(() => {
    setSidebarOpen(!isSidebarOpen);
  }, [isSidebarOpen]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex' }}>

      {/* Боковое меню только для мобильных */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={isSidebarOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            width: 240,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', p: 2 }}>
            <MenuItem>
              Dashboard
            </MenuItem>
            <MenuItem>
              Orders
            </MenuItem>
            <MenuItem>

              Customers
            </MenuItem>
          </Box>
        </Drawer>
      )}

      {/* Основной контент с отступами */}
      <Box 
        sx={{ 
          flexGrow: 1,
          p: 4,
          margin: { xs: 2, sm: 3, md: 4 },
          width: '100%',
          maxWidth: 1280,
          mx: 'auto'
        }}
      >
        <Toolbar />
      </Box>
    </Box>
  );
};