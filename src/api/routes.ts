// Shared with the worker so the paths the client calls and the paths the worker
// routes on cannot drift. A mismatch is silent: the worker falls through to the
// SPA shell and the client parses HTML as JSON.
export const API_BASE_PATH = '/api/v1/github';
export const CSP_REPORT_PATH = '/api/v1/csp-report';

export const routes = {
  githubUser: `${API_BASE_PATH}/user`,
  githubContributions: `${API_BASE_PATH}/contributions`,
} as const;
