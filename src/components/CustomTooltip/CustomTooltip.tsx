import { useThemeContext } from '@/state/appContext/ThemeContext';
import { Theme, Tooltip, tooltipClasses, TooltipProps } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTooltip = styled(({ className, ...props }: TooltipProps & { className?: string }) => (
  <Tooltip {...props} classes={{ popper: className }} arrow />
))(({ theme, isDark }: { theme: Theme; isDark: boolean }) => {
  const backgroundColor = isDark ? '#0d1117' : 'rgba(17, 24, 39, 0.7)';
  const arrowColor = backgroundColor;
  return {
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor,
      color: isDark ? '#c9d1d9' : '#ffffff',
      fontSize: theme.typography.caption.fontSize || '0.75rem',
      padding: '8px 12px',
      borderRadius: theme.shape.borderRadius,
      backdropFilter: isDark ? undefined : 'blur(4px)',
      maxWidth: theme.custom.sidebarWidth,
    },
    [`& .${tooltipClasses.arrow}`]: {
      color: arrowColor,
    },
  };
});

export const CustomTooltip = (props: TooltipProps) => {
  const { theme } = useThemeContext();
  const isDark = theme.palette.mode === 'dark';

  return <StyledTooltip {...props} isDark={isDark} />;
};
