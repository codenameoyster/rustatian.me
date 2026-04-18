import { describe, expect, it } from 'vitest';
import { variantForLanguage } from '../Badge';

describe('variantForLanguage', () => {
  it('returns neutral for null or undefined', () => {
    expect(variantForLanguage(null)).toBe('neutral');
    expect(variantForLanguage(undefined)).toBe('neutral');
  });

  it('returns neutral for empty string', () => {
    expect(variantForLanguage('')).toBe('neutral');
  });

  it('maps known languages case-insensitively', () => {
    expect(variantForLanguage('Go')).toBe('go');
    expect(variantForLanguage('GO')).toBe('go');
    expect(variantForLanguage('go')).toBe('go');
    expect(variantForLanguage('Rust')).toBe('rust');
    expect(variantForLanguage('Python')).toBe('python');
  });

  it('maps C and C++ to the rust palette', () => {
    expect(variantForLanguage('C')).toBe('rust');
    expect(variantForLanguage('C++')).toBe('rust');
    expect(variantForLanguage('c++')).toBe('rust');
  });

  it('maps JavaScript and TypeScript to the python palette', () => {
    expect(variantForLanguage('JavaScript')).toBe('python');
    expect(variantForLanguage('TypeScript')).toBe('python');
  });

  it('maps infrastructure languages to neutral', () => {
    expect(variantForLanguage('Shell')).toBe('neutral');
    expect(variantForLanguage('HTML')).toBe('neutral');
    expect(variantForLanguage('CSS')).toBe('neutral');
    expect(variantForLanguage('Dockerfile')).toBe('neutral');
  });

  it('falls back to neutral for unknown languages', () => {
    expect(variantForLanguage('Haskell')).toBe('neutral');
    expect(variantForLanguage('Ruby')).toBe('neutral');
    expect(variantForLanguage('Zig')).toBe('neutral');
  });
});
