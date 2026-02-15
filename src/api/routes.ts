const API_BASE_PATH = '/api/v1/github';
const SAFE_PATH_PATTERN = /^[a-zA-Z0-9._\-\/]+$/;

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

  /**
   * Returns the URL to fetch README.md via Worker proxy
   * @param owner - The GitHub username or organization
   * @param repo - The repository name
   * @param branch - Branch from repository
   * @returns URL string for the Worker API request
   **/
  getOwnerReadmeMD: (owner: string, repo: string, branch: string = 'master'): string => {
    if (!owner?.trim() || !repo?.trim()) {
      throw new Error('Owner and repo parameters are required');
    }
    if (!branch?.trim()) {
      throw new Error('Branch parameter cannot be empty');
    }

    return `${API_BASE_PATH}/readme`;
  },

  getBlogSummaryMd: (): string => `${API_BASE_PATH}/blog/summary`,

  getBlogInnerMd: ({
    startPath = '',
    endPath,
  }: {
    startPath?: string;
    endPath: string;
  }): string => {
    // Keep argument for backward-compatibility with existing call sites
    void startPath;

    return `${API_BASE_PATH}/blog/${sanitizeBlogPath(endPath)}`;
  },
};
