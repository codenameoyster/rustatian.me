import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconPerson from '@mui/icons-material/Person';
import IconCode from '@mui/icons-material/Code';
import IconQueryStats from '@mui/icons-material/QueryStats';
import IconMilitaryTech from '@mui/icons-material/MilitaryTech';
import IconContactPage from '@mui/icons-material/ContactPageOutlined';
import { DRAWER_WIDTH } from '@/constants';
import { Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { JSX } from 'preact/jsx-runtime';

interface INavigationItem {
  label: string;
  icon: JSX.Element;
};

const NavigationTopList: INavigationItem[] = [
  {
    label: 'About',
    icon: <IconPerson />
  },
  {
    label: 'Projects',
    icon: <IconCode />
  },
  {
    label: 'Stats',
    icon: <IconQueryStats />
  },
  {
    label: 'Awards',
    icon: <IconMilitaryTech/>
  }
];

const NavigationBottomList: INavigationItem[] = [
  {
    label: 'Contact Me',
    icon: <IconContactPage />
  }
]

interface INavDrawerProps {
  isMobileOpen: boolean;
  onClose: () => void;
  onTransitionEnd: () => void;
};

function DrawerContent() {
  return (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {NavigationTopList.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {NavigationBottomList.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export const NavDrawer = ({ isMobileOpen, onClose, onTransitionEnd }: INavDrawerProps) => {
  return (
    <Box
      component="nav"
      sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      aria-label="Navigation"
    >
      <Drawer
        variant="temporary"
        open={isMobileOpen}
        onTransitionEnd={onTransitionEnd}
        onClose={onClose}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
        }}
        slotProps={{
          root: {
            keepMounted: true,
          },
        }}
      >
        <DrawerContent />
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
        }}
        open
      >
        <DrawerContent />
      </Drawer>
    </Box>
  );
}
