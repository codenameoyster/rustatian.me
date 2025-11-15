import { useThemeContext } from '@/state/appContext/ThemeContext';
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import toc from 'markdown-it-table-of-contents';
import hljs from 'highlight.js';
import { full } from 'markdown-it-emoji';
import styles from './AboutME.module.scss';
import { useMemo, useRef, useEffect, useState } from 'preact/hooks';
import normalizeMDLinks from '@/utils/normalizeMDLinks';
import { AppCard } from '../AppCard/AppCard';
import DOMPurify from 'isomorphic-dompurify';

export const AboutMeMD = ({ text, basePath = '' }: { text: string; basePath: string }) => {
  const { theme } = useThemeContext();
  const preprocessedText = normalizeMDLinks(text, basePath);
  const contentRef = useRef<HTMLDivElement>(null);
  const [sanitizedHtml, setSanitizedHtml] = useState('');

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
      .use(toc, { includeLevel: [1, 2, 3] });

    const defaultRender =
      markdownIt.renderer.rules.link_open ||
      function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
      };

    markdownIt.renderer.rules.link_open = function (tokens, idx, options, env, self) {
      const token = tokens[idx];
      const hrefIndex = token.attrIndex('href');
      if (hrefIndex >= 0) {
        const href = token.attrs[hrefIndex][1];
        if (href.startsWith('http://') || href.startsWith('https://')) {
          token.attrPush(['rel', 'noopener noreferrer']);
          token.attrPush(['target', '_blank']);
        }
      }
      return defaultRender(tokens, idx, options, env, self);
    };

    return markdownIt;
  }, []);

  useEffect(() => {
    const rawHtml = md.render(preprocessedText);
    setSanitizedHtml(DOMPurify.sanitize(rawHtml));
  }, [preprocessedText, md]);

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
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </AppCard>
  );
};
