export default function isExternalLink(url: string): boolean {
  try {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return false;
    }

    const parsed = new URL(url);
    const currentDomain = window.location.hostname;

    return parsed.hostname !== currentDomain;
  } catch {
    return false;
  }
}
