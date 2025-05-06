export function decodeBase64(base64: string) {
  const bytes = Uint8Array.from(atob(base64.replace(/\n/g, '')), c => c.charCodeAt(0));

  return new TextDecoder('utf-8').decode(bytes);
}
