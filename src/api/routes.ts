const githubApiHost = (): string => 'https://api.github.com';

export const routes = {
  /**
   * Returns the URL to fetch a README.md file from a GitHub repository
   * @param owner - The GitHub username or organization
   * @param repo - The repository name
   * @returns URL string for the GitHub API request
   **/
  getReadmeMarkdownDocument: (owner: string, repo: string): string => {
    const url = new URL(`repos/${owner}/${repo}/contents/README.md`, githubApiHost());
    return url.toString();
  },

  /**
   * Returns a URL to fetch repositories from GitHub for the selected user
   * @param username - The GitHub username or organization
   * @returns URL string for the GitHub API request
   **/
  getUserRepositories: (username: string): string => {
    const url = new URL(`/users/${username}/repos?per_page=100`, githubApiHost());
    return url.toString();
  },
};
