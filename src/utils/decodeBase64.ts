/**
 * Decodes a Base64 string to UTF-8 text.
 * Works in both browser and Node.js environments.
 *
 * @param base64 - The Base64 encoded string to decode
 * @returns The decoded UTF-8 text, or an empty string if decoding fails
 */
export function decodeBase64(base64: string) {
  const clean = base64.replace(/\n/g, '');
  try {
    if (typeof atob === 'function') {
      const binary = atob(clean);
      const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
      return new TextDecoder('utf-8').decode(bytes);
    }
    // Node.js fallback
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(clean, 'base64').toString('utf-8');
    }
  } catch (error) {
    console.error('Failed to decode Base64 string:', error);
  }
  return '';
}
