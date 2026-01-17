import { describe, it, expect } from 'vitest';
import { routes, githubRawHost, githubAPIHost } from '../routes';

describe('routes', () => {
  describe('githubRawHost', () => {
    it('should return the correct GitHub raw host URL', () => {
      expect(githubRawHost()).toBe('https://raw.githubusercontent.com');
    });
  });

  describe('githubAPIHost', () => {
    it('should return the correct GitHub API host URL', () => {
      expect(githubAPIHost()).toBe('https://api.github.com');
    });
  });

  describe('getGitHubUser', () => {
    it('should return a valid GitHub API user URL', () => {
      const url = routes.getGitHubUser();
      expect(url).toMatch(/^https:\/\/api\.github\.com\/users\/.+$/);
    });
  });

  describe('getOwnerReadmeMD', () => {
    it('should return a valid README URL with default branch', () => {
      const url = routes.getOwnerReadmeMD('testowner', 'testrepo');
      expect(url).toBe('https://raw.githubusercontent.com/testowner/testrepo/master/README.md');
    });

    it('should return a valid README URL with custom branch', () => {
      const url = routes.getOwnerReadmeMD('testowner', 'testrepo', 'main');
      expect(url).toBe('https://raw.githubusercontent.com/testowner/testrepo/main/README.md');
    });

    it('should throw error for empty owner', () => {
      expect(() => routes.getOwnerReadmeMD('', 'testrepo')).toThrow(
        'Owner and repo parameters are required',
      );
    });

    it('should throw error for empty repo', () => {
      expect(() => routes.getOwnerReadmeMD('testowner', '')).toThrow(
        'Owner and repo parameters are required',
      );
    });

    it('should throw error for whitespace-only owner', () => {
      expect(() => routes.getOwnerReadmeMD('   ', 'testrepo')).toThrow(
        'Owner and repo parameters are required',
      );
    });

    it('should throw error for empty branch', () => {
      expect(() => routes.getOwnerReadmeMD('testowner', 'testrepo', '')).toThrow(
        'Branch parameter cannot be empty',
      );
    });
  });

  describe('getBlogSummaryMd', () => {
    it('should return a valid blog summary URL', () => {
      const url = routes.getBlogSummaryMd();
      expect(url).toMatch(/^https:\/\/raw\.githubusercontent\.com\/.+$/);
    });
  });

  describe('getBlogInnerMd', () => {
    it('should return a valid blog post URL', () => {
      const url = routes.getBlogInnerMd({ endPath: 'post-1/README.md' });
      expect(url).toMatch(/^https:\/\/raw\.githubusercontent\.com\/.+\/post-1\/README\.md$/);
    });

    it('should handle paths with leading slashes', () => {
      const url = routes.getBlogInnerMd({ endPath: '/post-1/README.md' });
      expect(url).toMatch(/post-1\/README\.md$/);
      expect(url).not.toMatch(/\/\/post-1/);
    });

    it('should throw error for empty endPath', () => {
      expect(() => routes.getBlogInnerMd({ endPath: '' })).toThrow('endPath parameter is required');
    });

    it('should throw error for whitespace-only endPath', () => {
      expect(() => routes.getBlogInnerMd({ endPath: '   ' })).toThrow(
        'endPath parameter is required',
      );
    });

    // Security tests - path traversal prevention
    describe('path traversal prevention', () => {
      it('should throw error for path with double dots (..)', () => {
        expect(() => routes.getBlogInnerMd({ endPath: '../secret/file.md' })).toThrow(
          'Invalid path: path traversal attempt detected',
        );
      });

      it('should throw error for path with embedded double dots', () => {
        expect(() => routes.getBlogInnerMd({ endPath: 'posts/../../../etc/passwd' })).toThrow(
          'Invalid path: path traversal attempt detected',
        );
      });

      it('should throw error for path with double slashes', () => {
        expect(() => routes.getBlogInnerMd({ endPath: 'posts//hidden/file.md' })).toThrow(
          'Invalid path: path traversal attempt detected',
        );
      });

      it('should throw error for path with backslashes', () => {
        expect(() => routes.getBlogInnerMd({ endPath: 'posts\\hidden\\file.md' })).toThrow(
          'Invalid path: path traversal attempt detected',
        );
      });

      it('should throw error for path with special characters', () => {
        expect(() => routes.getBlogInnerMd({ endPath: 'posts/<script>.md' })).toThrow(
          'Invalid path: contains unsafe characters',
        );
      });

      it('should throw error for path with spaces', () => {
        expect(() => routes.getBlogInnerMd({ endPath: 'posts/my file.md' })).toThrow(
          'Invalid path: contains unsafe characters',
        );
      });

      it('should throw error for path with question marks', () => {
        expect(() => routes.getBlogInnerMd({ endPath: 'posts/file.md?query=1' })).toThrow(
          'Invalid path: contains unsafe characters',
        );
      });

      it('should throw error for path with hash', () => {
        expect(() => routes.getBlogInnerMd({ endPath: 'posts/file.md#section' })).toThrow(
          'Invalid path: contains unsafe characters',
        );
      });
    });

    // Valid path tests
    describe('valid paths', () => {
      it('should allow alphanumeric paths', () => {
        expect(() =>
          routes.getBlogInnerMd({ endPath: 'posts/article123/README.md' }),
        ).not.toThrow();
      });

      it('should allow paths with hyphens', () => {
        expect(() =>
          routes.getBlogInnerMd({ endPath: 'posts/my-article/README.md' }),
        ).not.toThrow();
      });

      it('should allow paths with underscores', () => {
        expect(() =>
          routes.getBlogInnerMd({ endPath: 'posts/my_article/README.md' }),
        ).not.toThrow();
      });

      it('should allow paths with dots (for file extensions)', () => {
        expect(() => routes.getBlogInnerMd({ endPath: 'posts/article/index.md' })).not.toThrow();
      });

      it('should allow deeply nested paths', () => {
        expect(() =>
          routes.getBlogInnerMd({ endPath: 'posts/2024/01/my-article/README.md' }),
        ).not.toThrow();
      });
    });
  });
});
