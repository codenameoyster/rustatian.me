import { useThemeContext } from '@/state/appContext/ThemeContext';
import styles from './AboutME.module.scss';
import { AppCard } from '../AppCard/AppCard';
import { useMarkdownRenderer } from '@/hooks/useMarkdownRenderer';

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
