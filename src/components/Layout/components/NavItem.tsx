import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { useThemeContext } from '@/state/appContext/ThemeContext';
import { INavigationItem } from './types';

interface IProps {
  item: INavigationItem;
  isSelected: boolean;
  onClick: () => void;
}

export const NavItem = ({ item, isSelected, onClick }: IProps) => {
  const { theme } = useThemeContext();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <ListItem disablePadding>
      <ListItemButton
        onClick={onClick}
        selected={isSelected}
        sx={{
          maxHeight: '2.5rem',
          borderRadius: '0.375rem',
          px: '1rem',
          py: '0.75rem',
          color: isDarkMode ? '#c9d1d9' : '#374151',
          '&:hover': {
            backgroundColor: isDarkMode ? '#30363d' : '#f3f4f6',
            color: isDarkMode ? '#c9d1d9' : '#374151',
          },
          '&.Mui-selected': {
            backgroundColor: isDarkMode ? '#30363d' : '#f3f4f6',
            color: isDarkMode ? '#ffffff' : '#111827',
            '&:hover': {
              backgroundColor: isDarkMode ? '#30363d' : '#f3f4f6',
              color: isDarkMode ? '#ffffff' : '#111827',
            },
          },
        }}
      >
        <ListItemIcon>{item.icon}</ListItemIcon>
        <ListItemText primary={item.label} />
      </ListItemButton>
    </ListItem>
  );
};
