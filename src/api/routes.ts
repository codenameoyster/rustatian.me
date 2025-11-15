import { BLOG_ROOT_URL, BLOG_SUMMARY_MD_URL, PROFILE_NAME } from '@/constants';

export const githubRawHost = (): string => 'https://raw.githubusercontent.com';
export const githubAPIHost = (): string => 'https://api.github.com';

export const routes = {
  getGitHubUser: (): string => {
    const url = new URL(`/users/${PROFILE_NAME}`, githubAPIHost());
    return url.toString();
  },

  /**
   * Returns the URL to fetch a README.md file from a GitHub repository
   * @param owner - The GitHub username or organization
   * @param repo - The repository name
   * @param branch - Branch from repository
   * @returns URL string for the GitHub RAW request
   **/
  getOwnerReadmeMD: (owner: string, repo: string, branch: string = 'master'): string => {
    if (!owner?.trim() || !repo?.trim()) {
      throw new Error('Owner and repo parameters are required');
    }
    if (!branch?.trim()) {
      throw new Error('Branch parameter cannot be empty');
    }

    const url = new URL(`/${owner}/${repo}/${branch}/README.md`, githubRawHost());
    return url.toString();
  },

  getBlogSummaryMd: () => {
    const url = new URL(BLOG_SUMMARY_MD_URL, githubRawHost());
    return url.toString();
  },

  getBlogInnerMd: ({
    startPath = BLOG_ROOT_URL,
    endPath,
  }: {
    startPath?: string;
    endPath: string;
  }) => {
    if (!endPath?.trim()) {
      throw new Error('endPath parameter is required');
    }

    if (endPath.includes('..') || endPath.includes('//') || endPath.includes('\\')) {
      throw new Error('Invalid path: path traversal attempt detected');
    }

    const sanitizedEndPath = endPath.replace(/^\/+/, '');

    if (!/^[a-zA-Z0-9._\-\/]+$/.test(sanitizedEndPath)) {
      throw new Error('Invalid path: contains unsafe characters');
    }

    const sanitizedStartPath = startPath.replace(/^\/+/, '').replace(/\.\.+/g, '');
    const fullPath = new URL(`${sanitizedStartPath}/${sanitizedEndPath}`, githubRawHost());

    return fullPath.href;
  },
};
