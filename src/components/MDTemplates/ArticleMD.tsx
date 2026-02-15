import { useThemeContext } from '@/state/appContext/ThemeContext';
import styles from './ArticleMD.module.scss';
import { AppCard } from '../AppCard/AppCard';
import { useMarkdownRenderer } from '@/hooks/useMarkdownRenderer';

export const ArticleMD = ({ text, basePath = '' }: { text: string; basePath: string }) => {
  const { theme } = useThemeContext();
  const { sanitizedHtml } = useMarkdownRenderer(text, { basePath });

  return (
    <AppCard sx={{ mb: '6rem' }}>
      <div
        className={styles.markdownBody}
        data-theme={theme.palette.mode}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </AppCard>
  );
};
