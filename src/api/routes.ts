const API_BASE_PATH = '/api/v1/github';

export const routes = {
  getGitHubUser: (): string => `${API_BASE_PATH}/user`,
  getPinnedRepos: (): string => `${API_BASE_PATH}/pinned`,
  getPublicRepos: (): string => `${API_BASE_PATH}/repos`,
};
