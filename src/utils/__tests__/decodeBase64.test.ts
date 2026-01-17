import { describe, it, expect } from 'vitest';
import { decodeBase64 } from '../decodeBase64';

describe('decodeBase64', () => {
  describe('basic decoding', () => {
    it('should decode simple ASCII text', () => {
      // "Hello World" in base64
      expect(decodeBase64('SGVsbG8gV29ybGQ=')).toBe('Hello World');
    });

    it('should decode empty string', () => {
      expect(decodeBase64('')).toBe('');
    });

    it('should decode single character', () => {
      // "A" in base64
      expect(decodeBase64('QQ==')).toBe('A');
    });
  });

  describe('UTF-8 support', () => {
    it('should decode UTF-8 characters', () => {
      // "Hello 世界" in base64
      expect(decodeBase64('SGVsbG8g5LiW55WM')).toBe('Hello 世界');
    });

    it('should decode emoji', () => {
      // "Hello 👋" in base64
      expect(decodeBase64('SGVsbG8g8J+Riw==')).toBe('Hello 👋');
    });

    it('should decode Cyrillic text', () => {
      // "Привет" in base64
      expect(decodeBase64('0J/RgNC40LLQtdGC')).toBe('Привет');
    });
  });

  describe('newline handling', () => {
    it('should handle base64 with newlines', () => {
      // "Hello World" split across lines
      const base64WithNewlines = 'SGVsbG8g\nV29ybGQ=';
      expect(decodeBase64(base64WithNewlines)).toBe('Hello World');
    });

    it('should handle base64 with multiple newlines', () => {
      const base64WithMultipleNewlines = 'SGVs\nbG8g\nV29y\nbGQ=';
      expect(decodeBase64(base64WithMultipleNewlines)).toBe('Hello World');
    });
  });

  describe('edge cases', () => {
    it('should return empty string for invalid base64', () => {
      expect(decodeBase64('not-valid-base64!!!')).toBe('');
    });

    it('should handle padded base64', () => {
      // "a" = "YQ==", "ab" = "YWI=", "abc" = "YWJj"
      expect(decodeBase64('YQ==')).toBe('a');
      expect(decodeBase64('YWI=')).toBe('ab');
      expect(decodeBase64('YWJj')).toBe('abc');
    });

    it('should handle long strings', () => {
      // Long text encoded in base64
      const longText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
      const base64Long =
        'TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2NpbmcgZWxpdC4=';
      expect(decodeBase64(base64Long)).toBe(longText);
    });
  });
});
