import { describe, expect, it } from 'vitest';
import { API_BASE_PATH, CSP_REPORT_PATH, routes } from '../routes';

describe('routes', () => {
  it('points githubUser at the local worker user endpoint', () => {
    expect(routes.githubUser).toBe('/api/v1/github/user');
  });

  it('points githubContributions at the local worker contributions endpoint', () => {
    expect(routes.githubContributions).toBe('/api/v1/github/contributions');
  });

  it('exposes the prefixes the worker routes on', () => {
    expect(API_BASE_PATH).toBe('/api/v1/github');
    expect(CSP_REPORT_PATH).toBe('/api/v1/csp-report');
  });
});
