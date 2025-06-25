import { useThemeContext } from '@/state/appContext/ThemeContext';
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import toc from 'markdown-it-table-of-contents';
import hljs from 'highlight.js';
import { full } from 'markdown-it-emoji';
import styles from './ArticleMD.module.scss';
import { useEffect, useMemo, useRef } from 'preact/hooks';
import normalizeMDLinks from '@/utils/normalizeMDLinks';
import { AppCard } from '../AppCard/AppCard';
import sanitizer from 'markdown-it-sanitizer';
import 'highlight.js/styles/github.css';
import 'highlight.js/styles/github-dark.css';

export const ArticleMD = ({ text, basePath = '' }: { text: string; basePath: string }) => {
  const { theme } = useThemeContext();
  const preprocessedText = normalizeMDLinks(text, basePath);
  const contentRef = useRef<HTMLDivElement>(null);

  const md = useMemo(() => {
    const markdownIt = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            const highlighted = hljs.highlight(str, { language: lang }).value;
            return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
          } catch (e) {
            console.log('Highlight error:', e.message);
          }
        }
        return `<pre><code class="hljs">${markdownIt.utils.escapeHtml(str)}</code></pre>`;
      },
    })
      .use(full)
      .use(anchor)
      .use(toc, { includeLevel: [1, 2, 3] })
      .use(sanitizer);

    markdownIt.renderer.rules.link_open = undefined;

    return markdownIt;
  }, []);

  useEffect(() => {
    const THEME_ID = 'hljs-theme';

    const loadHighlightTheme = async () => {
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
          theme.palette.mode === 'dark' ? '/assets/css/github-dark.css' : '/assets/css/github.css';

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
        dangerouslySetInnerHTML={{ __html: md.render(preprocessedText) }}
      />
    </AppCard>
  );
};
