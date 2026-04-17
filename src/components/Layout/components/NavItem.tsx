import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import type { INavigationItem } from './types';

interface IProps {
  item: INavigationItem;
  isSelected: boolean;
  onClick: () => void;
}

export const NavItem = ({ item, isSelected, onClick }: IProps) => (
  <ListItem disablePadding>
    <ListItemButton
      onClick={onClick}
      selected={isSelected}
      sx={[
        {
          maxHeight: '2.5rem',
          borderRadius: '0.375rem',
          px: '1rem',
          py: '0.75rem',
          color: '#374151',
          '&:hover': {
            backgroundColor: '#f3f4f6',
            color: '#374151',
          },
          '&.Mui-selected': {
            backgroundColor: '#f3f4f6',
            color: '#111827',
            '&:hover': {
              backgroundColor: '#f3f4f6',
              color: '#111827',
            },
          },
        },
        theme =>
          theme.applyStyles('dark', {
            color: '#c9d1d9',
            '&:hover': {
              backgroundColor: '#30363d',
              color: '#c9d1d9',
            },
            '&.Mui-selected': {
              backgroundColor: '#30363d',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#30363d',
                color: '#ffffff',
              },
            },
          }),
      ]}
    >
      <ListItemIcon>{item.icon}</ListItemIcon>
      <ListItemText primary={item.label} />
    </ListItemButton>
  </ListItem>
);
