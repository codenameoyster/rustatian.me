import { ThemeSwitcher } from '@components/ThemeSwitcher/ThemeSwitcher';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';

interface ITopBarProps {
  onDrawerToggle: () => void;
}

export const TopBar = ({ onDrawerToggle }: ITopBarProps) => {
  const theme = useTheme();
  const drawerWidth = theme.custom.sidebarWidth;

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        background: 'transparent',
        boxShadow: 'none',
      }}
    >
      <Toolbar
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: {
            xs: 'space-between',
            sm: 'flex-end',
          },
        }}
      >
        <IconButton
          size="large"
          edge="start"
          color="default"
          sx={{
            mr: 2,
            display: { sm: 'none' },
          }}
          aria-label="open drawer"
          onClick={onDrawerToggle}
        >
          <MenuIcon />
        </IconButton>

        <ThemeSwitcher />
      </Toolbar>
    </AppBar>
  );
};
