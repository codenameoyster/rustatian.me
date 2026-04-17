import DOMPurify, { type Config as DomPurifyConfig } from 'dompurify';
import type MarkdownIt from 'markdown-it';
import type { Options } from 'markdown-it';
import type Renderer from 'markdown-it/lib/renderer.mjs';
import type Token from 'markdown-it/lib/token.mjs';
import { useEffect, useMemo, useState } from 'preact/hooks';
import normalizeMDLinks from '@/utils/normalizeMDLinks';

type RenderRule = (
  tokens: Token[],
  idx: number,
  options: Options,
  env: unknown,
  self: Renderer,
) => string;

const SANITIZE_CONFIG: DomPurifyConfig = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
  FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick'],
  ADD_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'class', 'id', 'colspan', 'rowspan'],
  ALLOWED_URI_REGEXP:
    /^(?:(?:https?|mailto|tel):|\/|#|data:image\/(?:png|gif|jpe?g|webp|svg\+xml);base64,)/i,
  ALLOW_UNKNOWN_PROTOCOLS: false,
};

let hasRegisteredHighlightLanguages = false;

const enforceExternalLinkSecurity = (html: string): string => {
  if (typeof DOMParser === 'undefined') {
    return html;
  }

  try {
    const documentNode = new DOMParser().parseFromString(html, 'text/html');
    const anchors = documentNode.querySelectorAll('a[href]');

    anchors.forEach(anchor => {
      const href = anchor.getAttribute('href');
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        anchor.setAttribute('rel', 'noopener noreferrer');
        anchor.setAttribute('target', '_blank');
      }
    });

    return documentNode.body.innerHTML;
  } catch {
    return html;
  }
};

const createMarkdownIt = async (tocLevels: number[]): Promise<MarkdownIt> => {
  const [
    markdownItModule,
    anchorModule,
    tocModule,
    emojiModule,
    hljsModule,
    javascriptModule,
    typescriptModule,
    goModule,
    rustModule,
    pythonModule,
    bashModule,
    jsonModule,
    yamlModule,
    xmlModule,
    markdownModule,
  ] = await Promise.all([
    import('markdown-it'),
    import('markdown-it-anchor'),
    import('markdown-it-table-of-contents'),
    import('markdown-it-emoji'),
    import('highlight.js/lib/core'),
    import('highlight.js/lib/languages/javascript'),
    import('highlight.js/lib/languages/typescript'),
    import('highlight.js/lib/languages/go'),
    import('highlight.js/lib/languages/rust'),
    import('highlight.js/lib/languages/python'),
    import('highlight.js/lib/languages/bash'),
    import('highlight.js/lib/languages/json'),
    import('highlight.js/lib/languages/yaml'),
    import('highlight.js/lib/languages/xml'),
    import('highlight.js/lib/languages/markdown'),
  ]);

  const MarkdownItConstructor = markdownItModule.default;
  const anchor = anchorModule.default;
  const toc = tocModule.default;
  const { full } = emojiModule;
  const hljs = hljsModule.default;

  if (!hasRegisteredHighlightLanguages) {
    hljs.registerLanguage('javascript', javascriptModule.default);
    hljs.registerLanguage('typescript', typescriptModule.default);
    hljs.registerLanguage('go', goModule.default);
    hljs.registerLanguage('rust', rustModule.default);
    hljs.registerLanguage('python', pythonModule.default);
    hljs.registerLanguage('bash', bashModule.default);
    hljs.registerLanguage('json', jsonModule.default);
    hljs.registerLanguage('yaml', yamlModule.default);
    hljs.registerLanguage('xml', xmlModule.default);
    hljs.registerLanguage('markdown', markdownModule.default);
    hasRegisteredHighlightLanguages = true;
  }

  const markdownIt: MarkdownIt = new MarkdownItConstructor({
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
    ((tokens: Token[], idx: number, options: Options, _env: unknown, self: Renderer): string =>
      self.renderToken(tokens, idx, options));

  // Custom link renderer for external links security
  markdownIt.renderer.rules.link_open = (
    tokens: Token[],
    idx: number,
    options: Options,
    env: unknown,
    self: Renderer,
  ): string => {
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
};

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
 * - HTML sanitization via DOMPurify (browser-side)
 * - Relative link normalization
 */
export const useMarkdownRenderer = (
  text: string,
  options: UseMarkdownRendererOptions = {},
): UseMarkdownRendererResult => {
  const { basePath = '', tocLevels = [1, 2, 3] } = options;

  const [sanitizedHtml, setSanitizedHtml] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);
  const tocLevelsKey = tocLevels.join(',');

  const preprocessedText = useMemo(() => normalizeMDLinks(text, basePath), [text, basePath]);

  useEffect(() => {
    let isDisposed = false;
    setIsProcessing(true);

    void (async () => {
      try {
        const parsedTocLevels = tocLevelsKey
          .split(',')
          .map(value => Number(value.trim()))
          .filter(value => Number.isFinite(value) && value > 0);

        const markdownIt = await createMarkdownIt(parsedTocLevels);
        const rawHtml = markdownIt.render(preprocessedText);
        const sanitized = DOMPurify.sanitize(rawHtml, SANITIZE_CONFIG);
        const hardened = enforceExternalLinkSecurity(sanitized);

        if (!isDisposed) {
          setSanitizedHtml(hardened);
        }
      } catch (error) {
        console.error('Markdown renderer failed:', error);
        if (!isDisposed) {
          setSanitizedHtml('');
        }
      } finally {
        if (!isDisposed) {
          setIsProcessing(false);
        }
      }
    })();

    return () => {
      isDisposed = true;
    };
  }, [preprocessedText, tocLevelsKey]);

  return { sanitizedHtml, isProcessing };
};
