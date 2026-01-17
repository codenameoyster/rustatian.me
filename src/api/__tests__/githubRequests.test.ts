import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getUser,
  getUserReadmeMDRequest,
  getBlogSummaryMdRequest,
  getBlogInnerMd,
} from '../githubRequests';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('githubRequests', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getUser', () => {
    const validUserData = {
      login: 'testuser',
      id: 12345,
      node_id: 'MDQ6VXNlcjEyMzQ1',
      avatar_url: 'https://avatars.githubusercontent.com/u/12345',
      gravatar_id: null,
      url: 'https://api.github.com/users/testuser',
      html_url: 'https://github.com/testuser',
      followers_url: 'https://api.github.com/users/testuser/followers',
      following_url: 'https://api.github.com/users/testuser/following{/other_user}',
      gists_url: 'https://api.github.com/users/testuser/gists{/gist_id}',
      starred_url: 'https://api.github.com/users/testuser/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/testuser/subscriptions',
      organizations_url: 'https://api.github.com/users/testuser/orgs',
      repos_url: 'https://api.github.com/users/testuser/repos',
      events_url: 'https://api.github.com/users/testuser/events{/privacy}',
      received_events_url: 'https://api.github.com/users/testuser/received_events',
      type: 'User',
      site_admin: false,
      name: 'Test User',
      company: 'Test Company',
      blog: 'https://testuser.dev',
      location: 'San Francisco',
      email: null,
      hireable: true,
      bio: 'A test user',
      twitter_username: 'testuser',
      public_repos: 42,
      public_gists: 10,
      followers: 100,
      following: 50,
      created_at: '2020-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    it('should fetch and validate user data successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(validUserData),
      });

      const user = await getUser();

      expect(user).toBeDefined();
      expect(user.login).toBe('testuser');
      expect(user.id).toBe(12345);
      expect(user.public_repos).toBe(42);
    });

    it('should throw error on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(getUser()).rejects.toThrow('GitHub API error: 404');
    });

    it('should throw error on rate limit (403)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      await expect(getUser()).rejects.toThrow('GitHub API error: 403');
    });

    it('should throw error on invalid data (missing required fields)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ login: 'test' }), // Missing required fields
      });

      await expect(getUser()).rejects.toThrow();
    });

    it('should handle extra fields gracefully (passthrough)', async () => {
      const userWithExtraFields = {
        ...validUserData,
        some_new_field: 'new value',
        another_field: 123,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(userWithExtraFields),
      });

      const user = await getUser();
      expect(user.login).toBe('testuser');
      // Extra fields should be passed through
      expect((user as Record<string, unknown>).some_new_field).toBe('new value');
    });
  });

  describe('getUserReadmeMDRequest', () => {
    it('should fetch README content successfully', async () => {
      const readmeContent = '# Hello World\n\nThis is a test README.';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(readmeContent),
      });

      const content = await getUserReadmeMDRequest();

      expect(content).toBe(readmeContent);
    });

    it('should throw error on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(getUserReadmeMDRequest()).rejects.toThrow('GitHub API error: 404');
    });

    it('should reject content exceeding 10MB', async () => {
      const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(largeContent),
      });

      await expect(getUserReadmeMDRequest()).rejects.toThrow();
    });
  });

  describe('getBlogSummaryMdRequest', () => {
    it('should fetch blog summary content successfully', async () => {
      const summaryContent = '# Blog\n\n- [Post 1](./post-1)\n- [Post 2](./post-2)';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(summaryContent),
      });

      const content = await getBlogSummaryMdRequest();

      expect(content).toBe(summaryContent);
    });

    it('should throw error on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getBlogSummaryMdRequest()).rejects.toThrow('GitHub API error: 500');
    });
  });

  describe('getBlogInnerMd', () => {
    it('should fetch blog post content successfully', async () => {
      const postContent = '# My Blog Post\n\nContent goes here.';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(postContent),
      });

      const content = await getBlogInnerMd('post-1/README.md');

      expect(content).toBe(postContent);
    });

    it('should throw error on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(getBlogInnerMd('nonexistent/README.md')).rejects.toThrow(
        'GitHub API error: 404',
      );
    });

    it('should throw error for path traversal attempts', async () => {
      await expect(getBlogInnerMd('../../../etc/passwd')).rejects.toThrow(
        'Invalid path: path traversal attempt detected',
      );
    });
  });
});
