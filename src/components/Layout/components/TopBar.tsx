import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { ThemeSwitcher } from '@components/ThemeSwitcher/ThemeSwitcher';
import { DRAWER_WIDTH } from '@/constants';

interface ITopBarProps {
  onDrawerToggle: () => void;
};

export const TopBar = ({ onDrawerToggle }: ITopBarProps) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { sm: `${DRAWER_WIDTH}px` },
      }}
    >
      <Toolbar>

      <IconButton
          size="large"
          edge="start"
          color="inherit"
          sx={{
            mr: 2,
            display: { sm: 'none' }
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
}
