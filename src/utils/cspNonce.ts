export const CSP_NONCE_PLACEHOLDER = '__CSP_NONCE__';

const NONCE_BYTE_LENGTH = 16;

export const generateCspNonce = (): string => {
  if (typeof crypto === 'undefined' || typeof crypto.getRandomValues !== 'function') {
    throw new Error('generateCspNonce requires crypto.getRandomValues');
  }
  const bytes = new Uint8Array(NONCE_BYTE_LENGTH);
  crypto.getRandomValues(bytes);

  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
};

export const injectCspNonceIntoHtml = (html: string, nonce: string): string => {
  if (!html.includes(CSP_NONCE_PLACEHOLDER)) return html;
  return html.split(CSP_NONCE_PLACEHOLDER).join(nonce);
};
