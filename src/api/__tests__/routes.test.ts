import { describe, expect, it } from 'vitest';
import { routes } from '../routes';

describe('routes', () => {
  it('points getGitHubUser at the local worker user endpoint', () => {
    expect(routes.getGitHubUser()).toBe('/api/v1/github/user');
  });

  it('points getPinnedRepos at the local worker pinned endpoint', () => {
    expect(routes.getPinnedRepos()).toBe('/api/v1/github/pinned');
  });

  it('points getPublicRepos at the local worker repos endpoint', () => {
    expect(routes.getPublicRepos()).toBe('/api/v1/github/repos');
  });
});
