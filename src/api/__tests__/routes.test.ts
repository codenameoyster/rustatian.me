import { describe, expect, it } from 'vitest';
import { routes } from '../routes';

describe('routes', () => {
  it('points getGitHubUser at the local worker user endpoint', () => {
    expect(routes.getGitHubUser()).toBe('/api/v1/github/user');
  });
});
