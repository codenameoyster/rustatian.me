import { useMarkdownRenderer } from '@/hooks/useMarkdownRenderer';
import { AppCard } from '../AppCard/AppCard';
import styles from './AboutME.module.scss';

export const AboutMeMD = ({ text, basePath = '' }: { text: string; basePath: string }) => {
  const { sanitizedHtml } = useMarkdownRenderer(text, { basePath });

  return (
    <AppCard
      sx={{
        mb: '2rem',
      }}
    >
      <div className={styles.markdownBody} dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
    </AppCard>
  );
};
