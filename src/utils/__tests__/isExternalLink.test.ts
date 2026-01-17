import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import isExternalLink from '../isExternalLink';

describe('isExternalLink', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { hostname: 'example.com' },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  describe('external links', () => {
    it('should return true for http:// external links', () => {
      expect(isExternalLink('http://google.com')).toBe(true);
    });

    it('should return true for https:// external links', () => {
      expect(isExternalLink('https://github.com/user/repo')).toBe(true);
    });

    it('should return true for external links with paths', () => {
      expect(isExternalLink('https://external.com/path/to/page')).toBe(true);
    });

    it('should return true for external links with query params', () => {
      expect(isExternalLink('https://external.com/page?query=1')).toBe(true);
    });
  });

  describe('internal links', () => {
    it('should return false for same domain links', () => {
      expect(isExternalLink('https://example.com/about')).toBe(false);
    });

    it('should return false for same domain with different path', () => {
      expect(isExternalLink('https://example.com/blog/post-1')).toBe(false);
    });

    it('should return false for relative links', () => {
      expect(isExternalLink('/about')).toBe(false);
    });

    it('should return false for relative links with paths', () => {
      expect(isExternalLink('/blog/post-1')).toBe(false);
    });

    it('should return false for anchor links', () => {
      expect(isExternalLink('#section')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should return false for empty string', () => {
      expect(isExternalLink('')).toBe(false);
    });

    it('should return false for invalid URLs', () => {
      expect(isExternalLink('not-a-url')).toBe(false);
    });

    it('should return false for javascript: protocol', () => {
      expect(isExternalLink('javascript:void(0)')).toBe(false);
    });

    it('should return false for mailto: links', () => {
      expect(isExternalLink('mailto:test@example.com')).toBe(false);
    });

    it('should return false for tel: links', () => {
      expect(isExternalLink('tel:+1234567890')).toBe(false);
    });

    it('should handle URLs without protocol correctly', () => {
      expect(isExternalLink('example.com')).toBe(false);
    });

    it('should handle malformed URLs gracefully', () => {
      expect(isExternalLink('http://')).toBe(false);
    });
  });
});
