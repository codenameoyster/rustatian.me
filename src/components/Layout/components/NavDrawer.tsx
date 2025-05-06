import Box from '@mui/material/Box';
import IconPerson from '@mui/icons-material/Person';
import IconCode from '@mui/icons-material/Code';
import IconQueryStats from '@mui/icons-material/QueryStats';
import IconMilitaryTech from '@mui/icons-material/MilitaryTech';
import IconContactPage from '@mui/icons-material/ContactPageOutlined';
import IconArticlePage from '@mui/icons-material/Article';
import {
  Divider,
  Drawer,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import { JSX } from 'preact/jsx-runtime';
import { useThemeContext } from '@/state/appContext/ThemeContext';
import { useLocation } from 'preact-iso';
import { GITHUB_RUSTATIAN_URL } from '@/constants';
import { useCallback } from 'preact/hooks';

interface INavigationItem {
  label: string;
  icon: JSX.Element;
  to: string;
}

const NavigationTopList: INavigationItem[] = [
  {
    label: 'About',
    icon: <IconPerson />,
    to: '/',
  },
  {
    label: 'Projects',
    icon: <IconCode />,
    to: '/projects',
  },
  {
    label: 'Stats',
    icon: <IconQueryStats />,
    to: '/stats',
  },
  {
    label: 'Awards',
    icon: <IconMilitaryTech />,
    to: '/awards',
  },
];

const NavigationBottomList: INavigationItem[] = [
  {
    label: 'Blog',
    icon: <IconArticlePage />,
    to: '/blog',
  },
  {
    label: 'Contact Me',
    icon: <IconContactPage />,
    to: '/contact',
  },
];

const NavigationItem = ({
  item,
  isSelected,
  onClick,
}: {
  item: INavigationItem;
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <ListItem disablePadding>
      <ListItemButton onClick={onClick} selected={isSelected}>
        <ListItemIcon>{item.icon}</ListItemIcon>
        <ListItemText primary={item.label} />
      </ListItemButton>
    </ListItem>
  );
};

function DrawerContent({ onClose }: { onClose?: () => void }) {
  const themeContext = useThemeContext();
  const { url, route } = useLocation();

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
      <Typography
        variant="h1"
        sx={{
          minHeight: themeContext.theme.custom.headerHeight,
          justifyContent: 'center',
          alignItems: 'center',
          display: 'flex',
        }}
      >
        <Link
          href={GITHUB_RUSTATIAN_URL}
          target="_blank"
          rel="noreferrer"
          underline="none"
          color="inherit"
        >
          Rustatian.me
        </Link>
      </Typography>
      <Divider />
      <List>
        {NavigationTopList.map(item => (
          <NavigationItem
            key={item.label}
            item={item}
            isSelected={url === item.to}
            onClick={() => handleListItemClick(item.to)}
          />
        ))}
      </List>
      <Divider />
      <List>
        {NavigationBottomList.map(item => (
          <NavigationItem
            key={item.label}
            item={item}
            isSelected={url === item.to}
            onClick={() => handleListItemClick(item.to)}
          />
        ))}
      </List>
    </div>
  );
}

interface INavDrawerProps {
  isMobileOpen: boolean;
  onClose: () => void;
  onTransitionEnd: () => void;
}

export const NavDrawer = ({ isMobileOpen, onClose, onTransitionEnd }: INavDrawerProps) => {
  const themeContext = useThemeContext();
  const drawerWidth = themeContext.theme.custom.sidebarWidth;

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
