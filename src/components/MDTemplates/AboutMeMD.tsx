import { useThemeContext } from '@/state/appContext/ThemeContext';
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import toc from 'markdown-it-table-of-contents';
import hljs from 'highlight.js';
import { full } from 'markdown-it-emoji';
import styles from './AboutME.module.scss';
import { useMemo, useRef } from 'preact/hooks';
import normalizeMDLinks from '@/utils/normalizeMDLinks';
import { AppCard } from '../AppCard/AppCard';
import sanitizer from 'markdown-it-sanitizer';

export const AboutMeMD = ({ text, basePath = '' }: { text: string; basePath: string }) => {
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
            return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`;
          } catch (e) {
            console.log('Highlight error:', e.message);
          }
        }
        return `<pre class="hljs"><code>${markdownIt.utils.escapeHtml(str)}</code></pre>`;
      },
    })
      .use(full)
      .use(anchor)
      .use(toc, { includeLevel: [1, 2, 3] })
      .use(sanitizer);

    markdownIt.renderer.rules.link_open = undefined;

    return markdownIt;
  }, []);

  return (
    <AppCard
      sx={{
        mb: '2rem',
      }}
    >
      <div
        ref={contentRef}
        className={styles.markdownBody}
        data-theme={theme.palette.mode}
        dangerouslySetInnerHTML={{ __html: md.render(preprocessedText) }}
      />
    </AppCard>
  );
};
