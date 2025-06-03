import { List } from '@mui/material';
import IconPerson from '@mui/icons-material/Person';
import IconBlog from '@mui/icons-material/EditSquare';
import { INavigationItem } from './types';
import { NavItem } from './NavItem';
import { useLocation } from 'preact-iso';

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
          isSelected={
            new URL(url, window.location.origin).pathname ===
            new URL(item.to, window.location.origin).pathname
          }
          onClick={() => onClick(item.to)}
        />
      ))}
    </List>
  );
};
