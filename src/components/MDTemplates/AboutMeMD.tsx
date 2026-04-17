import { useMarkdownRenderer } from '@/hooks/useMarkdownRenderer';
import { useThemeContext } from '@/state/appContext/ThemeContext';
import { AppCard } from '../AppCard/AppCard';
import styles from './AboutME.module.scss';

export const AboutMeMD = ({ text, basePath = '' }: { text: string; basePath: string }) => {
  const { theme } = useThemeContext();
  const { sanitizedHtml } = useMarkdownRenderer(text, { basePath });

  return (
    <AppCard
      sx={{
        mb: '2rem',
      }}
    >
      <div
        className={styles.markdownBody}
        data-theme={theme.palette.mode}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </AppCard>
  );
};
