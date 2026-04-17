import { Tooltip, type TooltipProps, tooltipClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTooltip = styled(({ className, ...props }: TooltipProps & { className?: string }) => (
  <Tooltip {...props} classes={className ? { popper: className } : undefined} arrow />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: 'rgba(17, 24, 39, 0.7)',
    color: '#ffffff',
    fontSize: theme.typography.caption?.fontSize ?? '0.75rem',
    padding: '8px 12px',
    borderRadius: theme.shape.borderRadius,
    backdropFilter: 'blur(4px)',
    maxWidth: theme.custom.sidebarWidth,
    ...theme.applyStyles('dark', {
      backgroundColor: '#0d1117',
      color: '#c9d1d9',
      backdropFilter: 'none',
    }),
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: 'rgba(17, 24, 39, 0.7)',
    ...theme.applyStyles('dark', {
      color: '#0d1117',
    }),
  },
}));

export const CustomTooltip = (props: TooltipProps) => <StyledTooltip {...props} />;
