import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/preact';
import { useMarkdownRenderer } from '../useMarkdownRenderer';

// Mock the normalizeMDLinks utility
vi.mock('@/utils/normalizeMDLinks', () => ({
  default: (text: string) => text, // Pass through for testing
}));

describe('useMarkdownRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('should render simple markdown text', async () => {
      const { result } = renderHook(() => useMarkdownRenderer('# Hello World'));

      await waitFor(() => {
        expect(result.current.sanitizedHtml).toContain('<h1');
        expect(result.current.sanitizedHtml).toContain('Hello World');
      });
    });

    it('should render paragraphs', async () => {
      const { result } = renderHook(() => useMarkdownRenderer('This is a paragraph.'));

      await waitFor(() => {
        expect(result.current.sanitizedHtml).toContain('<p>');
        expect(result.current.sanitizedHtml).toContain('This is a paragraph.');
      });
    });

    it('should render bold text', async () => {
      const { result } = renderHook(() => useMarkdownRenderer('**bold text**'));

      await waitFor(() => {
        expect(result.current.sanitizedHtml).toContain('<strong>');
        expect(result.current.sanitizedHtml).toContain('bold text');
      });
    });

    it('should render italic text', async () => {
      const { result } = renderHook(() => useMarkdownRenderer('*italic text*'));

      await waitFor(() => {
        expect(result.current.sanitizedHtml).toContain('<em>');
        expect(result.current.sanitizedHtml).toContain('italic text');
      });
    });
  });

  describe('code highlighting', () => {
    it('should render inline code', async () => {
      const { result } = renderHook(() => useMarkdownRenderer('Use `console.log()` for debugging'));

      await waitFor(() => {
        expect(result.current.sanitizedHtml).toContain('<code>');
        expect(result.current.sanitizedHtml).toContain('console.log()');
      });
    });

    it('should render code blocks with language', async () => {
      const markdown = '```javascript\nconst x = 1;\n```';
      const { result } = renderHook(() => useMarkdownRenderer(markdown));

      await waitFor(() => {
        expect(result.current.sanitizedHtml).toContain('<pre>');
        expect(result.current.sanitizedHtml).toContain('<code');
        expect(result.current.sanitizedHtml).toContain('hljs');
      });
    });

    it('should render code blocks without language', async () => {
      const markdown = '```\nplain text\n```';
      const { result } = renderHook(() => useMarkdownRenderer(markdown));

      await waitFor(() => {
        expect(result.current.sanitizedHtml).toContain('<pre>');
        expect(result.current.sanitizedHtml).toContain('plain text');
      });
    });
  });

  describe('links', () => {
    it('should render internal links', async () => {
      const { result } = renderHook(() => useMarkdownRenderer('[Link](/page)'));

      await waitFor(() => {
        expect(result.current.sanitizedHtml).toContain('<a');
        expect(result.current.sanitizedHtml).toContain('href="/page"');
      });
    });

    it('should add rel attribute to external links', async () => {
      const { result } = renderHook(() => useMarkdownRenderer('[External](https://example.com)'));

      await waitFor(() => {
        // Note: DOMPurify may strip target="_blank" for security, but rel should be preserved
        expect(result.current.sanitizedHtml).toContain('rel="noopener noreferrer"');
      });
    });

    it('should add rel attribute to http links', async () => {
      const { result } = renderHook(() => useMarkdownRenderer('[HTTP Link](http://example.com)'));

      await waitFor(() => {
        expect(result.current.sanitizedHtml).toContain('rel="noopener noreferrer"');
      });
    });
  });

  describe('emoji support', () => {
    it('should render emoji shortcodes', async () => {
      const { result } = renderHook(() => useMarkdownRenderer('Hello :smile:'));

      await waitFor(() => {
        // Emoji plugin converts :smile: to actual emoji
        expect(result.current.sanitizedHtml).toContain('😄');
      });
    });
  });

  describe('HTML sanitization', () => {
    it('should sanitize dangerous HTML', async () => {
      const dangerousMarkdown = '<script>alert("xss")</script>';
      const { result } = renderHook(() => useMarkdownRenderer(dangerousMarkdown));

      await waitFor(() => {
        expect(result.current.sanitizedHtml).not.toContain('<script>');
        expect(result.current.sanitizedHtml).not.toContain('alert');
      });
    });

    it('should sanitize onclick attributes', async () => {
      const dangerousMarkdown = '<a href="#" onclick="alert(1)">Click</a>';
      const { result } = renderHook(() => useMarkdownRenderer(dangerousMarkdown));

      await waitFor(() => {
        expect(result.current.sanitizedHtml).not.toContain('onclick');
      });
    });

    it('should allow safe HTML tags', async () => {
      const safeMarkdown = '<strong>Bold</strong> and <em>italic</em>';
      const { result } = renderHook(() => useMarkdownRenderer(safeMarkdown));

      await waitFor(() => {
        expect(result.current.sanitizedHtml).toContain('<strong>');
        expect(result.current.sanitizedHtml).toContain('<em>');
      });
    });
  });

  describe('processing state', () => {
    it('should set isProcessing to false after rendering', async () => {
      const { result } = renderHook(() => useMarkdownRenderer('# Test'));

      await waitFor(() => {
        expect(result.current.isProcessing).toBe(false);
        expect(result.current.sanitizedHtml).toContain('Test');
      });
    });
  });

  describe('options', () => {
    it('should use default TOC levels if not specified', async () => {
      const markdown = '[[toc]]\n# H1\n## H2\n### H3\n#### H4';
      const { result } = renderHook(() => useMarkdownRenderer(markdown));

      await waitFor(() => {
        // Default includes levels 1, 2, 3
        expect(result.current.sanitizedHtml).toContain('class="table-of-contents"');
      });
    });

    it('should accept custom TOC levels', async () => {
      const markdown = '[[toc]]\n# H1\n## H2';
      const { result } = renderHook(() => useMarkdownRenderer(markdown, { tocLevels: [1, 2] }));

      await waitFor(() => {
        expect(result.current.sanitizedHtml).toContain('class="table-of-contents"');
      });
    });
  });
});
