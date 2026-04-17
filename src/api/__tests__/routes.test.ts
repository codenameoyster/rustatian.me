import { describe, expect, it } from 'vitest';
import { routes } from '../routes';

describe('routes', () => {
  describe('getGitHubUser', () => {
    it('should return the local Worker user endpoint', () => {
      expect(routes.getGitHubUser()).toBe('/api/v1/github/user');
    });
  });

  describe('getOwnerReadmeMD', () => {
    it('should return local Worker README endpoint', () => {
      expect(routes.getOwnerReadmeMD()).toBe('/api/v1/github/readme');
    });
  });

  describe('getBlogSummaryMd', () => {
    it('should return local Worker summary endpoint', () => {
      expect(routes.getBlogSummaryMd()).toBe('/api/v1/github/blog/summary');
    });
  });

  describe('getBlogInnerMd', () => {
    it('should return a valid local blog post endpoint', () => {
      const endpoint = routes.getBlogInnerMd('post-1/README.md');
      expect(endpoint).toBe('/api/v1/github/blog/post-1/README.md');
    });

    it('should handle paths with leading slashes', () => {
      const endpoint = routes.getBlogInnerMd('/post-1/README.md');
      expect(endpoint).toBe('/api/v1/github/blog/post-1/README.md');
    });

    it('should throw error for empty endPath', () => {
      expect(() => routes.getBlogInnerMd('')).toThrow('endPath parameter is required');
    });

    it('should throw error for whitespace-only endPath', () => {
      expect(() => routes.getBlogInnerMd('   ')).toThrow('endPath parameter is required');
    });

    describe('path traversal prevention', () => {
      it('should throw error for path with double dots (..)', () => {
        expect(() => routes.getBlogInnerMd('../secret/file.md')).toThrow(
          'Invalid path: path traversal attempt detected',
        );
      });

      it('should throw error for path with embedded double dots', () => {
        expect(() => routes.getBlogInnerMd('posts/../../../etc/passwd')).toThrow(
          'Invalid path: path traversal attempt detected',
        );
      });

      it('should throw error for malformed percent-encoded path', () => {
        expect(() => routes.getBlogInnerMd('%E')).toThrow(
          'Invalid path: contains unsafe characters',
        );
      });

      it('should throw error for encoded path traversal payload', () => {
        expect(() => routes.getBlogInnerMd('%2E%2E%2Fsecret.md')).toThrow(
          'Invalid path: path traversal attempt detected',
        );
      });

      it('should throw error for path with double slashes', () => {
        expect(() => routes.getBlogInnerMd('posts//hidden/file.md')).toThrow(
          'Invalid path: path traversal attempt detected',
        );
      });

      it('should throw error for path with backslashes', () => {
        expect(() => routes.getBlogInnerMd('posts\\hidden\\file.md')).toThrow(
          'Invalid path: path traversal attempt detected',
        );
      });

      it('should throw error for path with special characters', () => {
        expect(() => routes.getBlogInnerMd('posts/<script>.md')).toThrow(
          'Invalid path: contains unsafe characters',
        );
      });

      it('should throw error for path with spaces', () => {
        expect(() => routes.getBlogInnerMd('posts/my file.md')).toThrow(
          'Invalid path: contains unsafe characters',
        );
      });

      it('should throw error for path with question marks', () => {
        expect(() => routes.getBlogInnerMd('posts/file.md?query=1')).toThrow(
          'Invalid path: contains unsafe characters',
        );
      });

      it('should throw error for path with hash', () => {
        expect(() => routes.getBlogInnerMd('posts/file.md#section')).toThrow(
          'Invalid path: contains unsafe characters',
        );
      });
    });

    describe('valid paths', () => {
      it('should allow alphanumeric paths', () => {
        expect(() => routes.getBlogInnerMd('posts/article123/README.md')).not.toThrow();
      });

      it('should allow paths with hyphens', () => {
        expect(() => routes.getBlogInnerMd('posts/my-article/README.md')).not.toThrow();
      });

      it('should allow paths with underscores', () => {
        expect(() => routes.getBlogInnerMd('posts/my_article/README.md')).not.toThrow();
      });

      it('should allow paths with dots (for file extensions)', () => {
        expect(() => routes.getBlogInnerMd('posts/article/index.md')).not.toThrow();
      });

      it('should allow deeply nested paths', () => {
        expect(() => routes.getBlogInnerMd('posts/2024/01/my-article/README.md')).not.toThrow();
      });
    });
  });
});
