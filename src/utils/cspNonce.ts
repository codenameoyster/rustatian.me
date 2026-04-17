export const CSP_NONCE_PLACEHOLDER = '__CSP_NONCE__';

const NONCE_BYTE_LENGTH = 16;

export const generateCspNonce = (): string => {
  const bytes = new Uint8Array(NONCE_BYTE_LENGTH);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

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
