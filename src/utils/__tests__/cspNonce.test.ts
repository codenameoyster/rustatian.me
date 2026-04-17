import { describe, expect, it } from 'vitest';
import { CSP_NONCE_PLACEHOLDER, generateCspNonce, injectCspNonceIntoHtml } from '../cspNonce';

describe('generateCspNonce', () => {
  it('returns a 24-character base64 string (128 bits + padding)', () => {
    const nonce = generateCspNonce();
    expect(nonce).toMatch(/^[A-Za-z0-9+/]+=*$/);
    expect(nonce.length).toBe(24);
  });

  it('returns a new value on every call', () => {
    const values = new Set(Array.from({ length: 10 }, () => generateCspNonce()));
    expect(values.size).toBe(10);
  });
});

describe('injectCspNonceIntoHtml', () => {
  it('replaces every placeholder occurrence with the nonce', () => {
    const html = `<head>
<meta name="csp-nonce" content="${CSP_NONCE_PLACEHOLDER}">
<style nonce="${CSP_NONCE_PLACEHOLDER}">body { color: red; }</style>
</head>`;
    const result = injectCspNonceIntoHtml(html, 'abc123');
    expect(result).not.toContain(CSP_NONCE_PLACEHOLDER);
    expect(result).toContain('content="abc123"');
    expect(result).toContain('nonce="abc123"');
  });

  it('returns input unchanged when placeholder is absent', () => {
    const html = '<head></head>';
    expect(injectCspNonceIntoHtml(html, 'abc123')).toBe(html);
  });

  it('preserves characters adjacent to the placeholder', () => {
    const html = `<meta name="csp-nonce-placeholder-like" content="${CSP_NONCE_PLACEHOLDER}XYZ">`;
    const result = injectCspNonceIntoHtml(html, 'N');
    expect(result).toContain('content="NXYZ"');
    expect(result).toContain('name="csp-nonce-placeholder-like"');
  });
});
