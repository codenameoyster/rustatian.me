const API_BASE_PATH = '/api/v1/github';
const SAFE_PATH_PATTERN = /^[a-zA-Z0-9._\-/]+$/;

const sanitizeBlogPath = (endPath: string): string => {
  if (!endPath?.trim()) {
    throw new Error('endPath parameter is required');
  }

  let decodedPath = '';

  try {
    decodedPath = decodeURIComponent(endPath);
  } catch {
    throw new Error('Invalid path: contains unsafe characters');
  }

  if (decodedPath.includes('..') || decodedPath.includes('//') || decodedPath.includes('\\')) {
    throw new Error('Invalid path: path traversal attempt detected');
  }

  const sanitizedEndPath = decodedPath.replace(/^\/+/, '');

  if (!SAFE_PATH_PATTERN.test(sanitizedEndPath)) {
    throw new Error('Invalid path: contains unsafe characters');
  }

  return sanitizedEndPath;
};

export const routes = {
  getGitHubUser: (): string => `${API_BASE_PATH}/user`,

  getOwnerReadmeMD: (): string => `${API_BASE_PATH}/readme`,

  getBlogSummaryMd: (): string => `${API_BASE_PATH}/blog/summary`,

  getBlogInnerMd: (endPath: string): string => {
    return `${API_BASE_PATH}/blog/${sanitizeBlogPath(endPath)}`;
  },
};
