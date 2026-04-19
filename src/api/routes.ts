const API_BASE_PATH = '/api/v1/github';

export const routes = {
  getGitHubUser: (): string => `${API_BASE_PATH}/user`,
  getGitHubContributions: (): string => `${API_BASE_PATH}/contributions`,
};
