import { describe, expect, it } from 'vitest';
import { routes } from '../routes';

describe('routes', () => {
  it('points getGitHubUser at the local worker user endpoint', () => {
    expect(routes.getGitHubUser()).toBe('/api/v1/github/user');
  });

  it('points getGitHubContributions at the local worker contributions endpoint', () => {
    expect(routes.getGitHubContributions()).toBe('/api/v1/github/contributions');
  });
});
