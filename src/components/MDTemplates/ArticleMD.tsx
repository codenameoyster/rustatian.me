import { useMarkdownRenderer } from '@/hooks/useMarkdownRenderer';
import { AppCard } from '../AppCard/AppCard';
import styles from './ArticleMD.module.scss';

export const ArticleMD = ({ text, basePath = '' }: { text: string; basePath: string }) => {
  const { sanitizedHtml } = useMarkdownRenderer(text, { basePath });

  return (
    <AppCard sx={{ mb: '6rem' }}>
      <div className={styles.markdownBody} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
    </AppCard>
  );
};
