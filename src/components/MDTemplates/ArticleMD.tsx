import { useThemeContext } from '@/state/appContext/ThemeContext';
import styles from './ArticleMD.module.scss';
import { useEffect, useRef } from 'preact/hooks';
import { AppCard } from '../AppCard/AppCard';
import { useMarkdownRenderer } from '@/hooks/useMarkdownRenderer';
import 'highlight.js/styles/github.css';
import 'highlight.js/styles/github-dark.css';

export const ArticleMD = ({ text, basePath = '' }: { text: string; basePath: string }) => {
  const { theme } = useThemeContext();
  const contentRef = useRef<HTMLDivElement>(null);

  const { sanitizedHtml } = useMarkdownRenderer(text, { basePath });

  useEffect(() => {
    const THEME_ID = 'hljs-theme';

    const loadHighlightTheme = () => {
      const oldStyle = document.getElementById(THEME_ID);
      if (oldStyle) {
        oldStyle.remove();
      }

      try {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.id = THEME_ID;
        link.type = 'text/css';
        link.href =
          theme.palette.mode === 'dark'
            ? `${import.meta.env.BASE_URL}assets/css/github-dark.css`
            : `${import.meta.env.BASE_URL}assets/css/github.css`;

        document.head.appendChild(link);
      } catch (error) {
        console.warn('Failed to load highlight.js theme:', error);
      }
    };

    loadHighlightTheme();
  }, [theme.palette.mode]);

  return (
    <AppCard sx={{ mb: '6rem' }}>
      <div
        ref={contentRef}
        className={styles.markdownBody}
        data-theme={theme.palette.mode}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </AppCard>
  );
};
