import { useThemeContext } from '@/state/appContext/ThemeContext';
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import toc from 'markdown-it-table-of-contents';
import hljs from 'highlight.js';
import { full } from 'markdown-it-emoji';
import styles from './ArticleMD.module.scss';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import normalizeMDLinks from '@/utils/normalizeMDLinks';
import { AppCard } from '../AppCard/AppCard';
import 'highlight.js/styles/github.css';
import 'highlight.js/styles/github-dark.css';
import DOMPurify from 'isomorphic-dompurify';

export const ArticleMD = ({ text, basePath = '' }: { text: string; basePath: string }) => {
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
