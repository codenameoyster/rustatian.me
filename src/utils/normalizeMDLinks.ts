import { BLOG_SUBDIRECTORY } from '@/constants';

function normalizeMDLinks(mdText: string, basePath: string): string {
  const cleanedBasePath = basePath.replace(/\/?[^/]+\.\w+$/, '');
  const domain = import.meta.env.VITE_PUBLIC_WEBSITE_DOMAIN;

  if (!domain) {
    console.warn('VITE_PUBLIC_WEBSITE_DOMAIN not defined, using relative paths');
    return mdText;
  }

  let base: URL;
  try {
    base = new URL(`${domain}/${cleanedBasePath.replace(/^\/+/, '')}/`);
  } catch (error) {
    console.error('Invalid domain or base path:', { domain, cleanedBasePath });
    console.error(error.message);
    return mdText;
  }

  return mdText
    .replace(/(?<!(?:!|\\))\[([^\]]+)]\((?!https?:\/\/|#|\/)([^)]+)\)/g, (_, text, href) => {
      let fullPath: string;
      try {
        fullPath = new URL(href, base).pathname;
      } catch {
        return _;
      }
      return `[${text}](${normalizePath(fullPath)})`;
    })
    .replace(/(?<!\\)!\[([^\]]*)]\((?!https?:\/\/|#|\/)([^)]+)\)/g, (_, alt, src) => {
      let fullPath: string;
      try {
        fullPath = new URL(src, base).pathname;
      } catch {
        return _;
      }
      return `![${alt}](${normalizePath(fullPath)})`;
    });
}

function normalizePath(path: string): string {
  const segments = path.split('/').filter(Boolean);
  const result: string[] = [];

  for (const seg of segments) {
    if (seg === '..') result.pop();
    else if (seg !== '.') result.push(seg);
  }

  return `/${BLOG_SUBDIRECTORY}/` + result.join('/');
}

export default normalizeMDLinks;
