import IconBlog from '@mui/icons-material/EditSquare';
import IconPerson from '@mui/icons-material/Person';
import { List } from '@mui/material';
import { useLocation } from 'preact-iso';
import { NavItem } from './NavItem';
import type { INavigationItem } from './types';

const NavigationList: INavigationItem[] = [
  {
    label: 'About',
    icon: <IconPerson />,
    to: '/',
  },
  {
    label: 'Blog',
    icon: <IconBlog />,
    to: '/blog',
  },
];

export const NavList = ({ onClick }: { onClick: (to: string) => void }) => {
  const { url } = useLocation();
  const currentPathname = new URL(url, 'https://rustatian.me').pathname;

  return (
    <List
      sx={{
        display: 'flex',
        flexDirection: 'column',
        rowGap: '0.5rem',
        pb: '2rem',
      }}
    >
      {NavigationList.map(item => (
        <NavItem
          key={item.label}
          item={item}
          isSelected={currentPathname === new URL(item.to, 'https://rustatian.me').pathname}
          onClick={() => onClick(item.to)}
        />
      ))}
    </List>
  );
};
