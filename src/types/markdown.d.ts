declare module 'markdown-it-table-of-contents' {
  import MarkdownIt from 'markdown-it';

  interface TocOptions {
    includeLevel?: number[];
    containerClass?: string;
    slugify?: (s: string) => string;
    markerPattern?: RegExp;
    listType?: 'ul' | 'ol';
    format?: (content: string, md: MarkdownIt) => string;
    forceFullToc?: boolean;
    containerHeaderHtml?: string;
    containerFooterHtml?: string;
    transformLink?: (link: string) => string;
  }

  function tocPlugin(md: MarkdownIt, options?: TocOptions): void;
  export default tocPlugin;
}

declare module 'markdown-it-emoji' {
  import MarkdownIt from 'markdown-it';

  interface EmojiOptions {
    defs?: Record<string, string>;
    enabled?: string[];
    shortcuts?: Record<string, string | string[]>;
  }

  export function full(md: MarkdownIt, options?: EmojiOptions): void;
}

declare module 'eslint-plugin-preact';
