import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { ThemeSwitcher } from '@components/ThemeSwitcher/ThemeSwitcher';
import { useThemeContext } from '@/state/appContext/ThemeContext';

interface ITopBarProps {
  onDrawerToggle: () => void;
}

export const TopBar = ({ onDrawerToggle }: ITopBarProps) => {
  const themeContext = useThemeContext();
  const drawerWidth = themeContext.theme.custom.sidebarWidth;

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        background: themeContext.theme.custom.headerGradient,
        boxShadow: 'none',
        borderBottom: '1px solid',
        borderColor: themeContext.theme.palette.divider,
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
