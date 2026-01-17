import { useMemo, useEffect, useState } from 'preact/hooks';
import MarkdownIt, { Options } from 'markdown-it';
import type Token from 'markdown-it/lib/token.mjs';
import type Renderer from 'markdown-it/lib/renderer.mjs';
import anchor from 'markdown-it-anchor';
import toc from 'markdown-it-table-of-contents';
import hljs from 'highlight.js';
import { full } from 'markdown-it-emoji';
import DOMPurify from 'isomorphic-dompurify';
import normalizeMDLinks from '@/utils/normalizeMDLinks';

type RenderRule = (
  tokens: Token[],
  idx: number,
  options: Options,
  env: unknown,
  self: Renderer,
) => string;

export interface UseMarkdownRendererOptions {
  /** Base path for resolving relative links */
  basePath?: string;
  /** Include table of contents levels */
  tocLevels?: number[];
}

export interface UseMarkdownRendererResult {
  /** Sanitized HTML content ready for rendering */
  sanitizedHtml: string;
  /** Whether the content is currently being processed */
  isProcessing: boolean;
}

/**
 * Custom hook for rendering markdown content with syntax highlighting,
 * table of contents, emoji support, and HTML sanitization.
 *
 * Features:
 * - Syntax highlighting via highlight.js
 * - Table of contents generation
 * - Emoji support
 * - External link security (noopener noreferrer, _blank)
 * - HTML sanitization via DOMPurify (isomorphic - works in SSR)
 * - Relative link normalization
 */
export const useMarkdownRenderer = (
  text: string,
  options: UseMarkdownRendererOptions = {},
): UseMarkdownRendererResult => {
  const { basePath = '', tocLevels = [1, 2, 3] } = options;

  const [sanitizedHtml, setSanitizedHtml] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);

  const preprocessedText = useMemo(() => normalizeMDLinks(text, basePath), [text, basePath]);

  const md = useMemo(() => {
    const markdownIt: MarkdownIt = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      highlight: (str: string, lang: string): string => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            const highlighted = hljs.highlight(str, { language: lang }).value;
            return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
          } catch (e) {
            const error = e instanceof Error ? e.message : 'Unknown error';
            console.error('Highlight error:', error);
          }
        }
        return `<pre><code class="hljs">${markdownIt.utils.escapeHtml(str)}</code></pre>`;
      },
    })
      .use(full)
      .use(anchor)
      .use(toc, { includeLevel: tocLevels });

    // Store default renderer
    const defaultRender: RenderRule =
      markdownIt.renderer.rules.link_open ??
      function (
        tokens: Token[],
        idx: number,
        options: Options,
        _env: unknown,
        self: Renderer,
      ): string {
        return self.renderToken(tokens, idx, options);
      };

    // Custom link renderer for external links security
    markdownIt.renderer.rules.link_open = function (
      tokens: Token[],
      idx: number,
      options: Options,
      env: unknown,
      self: Renderer,
    ): string {
      const token = tokens[idx];
      if (token) {
        const hrefIndex = token.attrIndex('href');
        if (hrefIndex >= 0 && token.attrs) {
          const hrefAttr = token.attrs[hrefIndex];
          const href = hrefAttr?.[1];
          if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
            token.attrPush(['rel', 'noopener noreferrer']);
            token.attrPush(['target', '_blank']);
          }
        }
      }
      return defaultRender(tokens, idx, options, env, self);
    };

    return markdownIt;
  }, [tocLevels]);

  useEffect(() => {
    setIsProcessing(true);

    const rawHtml = md.render(preprocessedText);
    // Use isomorphic-dompurify which works both in browser and Node.js
    const sanitized = DOMPurify.sanitize(rawHtml);
    setSanitizedHtml(sanitized);

    setIsProcessing(false);
  }, [preprocessedText, md]);

  return { sanitizedHtml, isProcessing };
};
