import { PROFILE_NAME, PROFILE_REPO_NAME, PROFILE_BRANCH } from '@/constants';
import { routes } from './routes';
import { IBaseUser } from './types';
import { z } from 'zod';

const GitHubUserSchema = z
  .object({
    login: z.string(),
    id: z.number(),
    node_id: z.string(),
    avatar_url: z.url(),
    gravatar_id: z.string().nullable(),
    url: z.url(),
    html_url: z.url(),
    followers_url: z.url(),
    following_url: z.string(),
    gists_url: z.string(),
    starred_url: z.string(),
    subscriptions_url: z.url(),
    organizations_url: z.url(),
    repos_url: z.url(),
    events_url: z.string(),
    received_events_url: z.url(),
    type: z.string(),
    site_admin: z.boolean(),
    name: z.string().nullable(),
    company: z.string().nullable(),
    blog: z.string().nullable(),
    location: z.string().nullable(),
    email: z.string().nullable().optional(),
    notification_email: z.string().nullable().optional(),
    hireable: z.boolean().nullable(),
    bio: z.string().nullable(),
    twitter_username: z.string().nullable(),
    public_repos: z.number(),
    public_gists: z.number(),
    followers: z.number(),
    following: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
  })
  .loose();

const MarkdownContentSchema = z.string().max(10 * 1024 * 1024);

export const getUser: () => Promise<IBaseUser> = async () => {
  const response = await fetch(routes.getGitHubUser());

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = await response.json();
  const validated = GitHubUserSchema.parse(data);

  return validated as IBaseUser;
};

export const getUserReadmeMDRequest: () => Promise<string> = async () => {
  const response = await fetch(
    routes.getOwnerReadmeMD(PROFILE_NAME, PROFILE_REPO_NAME, PROFILE_BRANCH),
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const content = await response.text();
  return MarkdownContentSchema.parse(content);
};

export const getBlogSummaryMdRequest: () => Promise<string> = async () => {
  const response = await fetch(routes.getBlogSummaryMd());

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const content = await response.text();
  return MarkdownContentSchema.parse(content);
};

export const getBlogInnerMd: (path: string) => Promise<string> = async path => {
  const route = routes.getBlogInnerMd({ endPath: path });

  const response = await fetch(route);

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const content = await response.text();
  return MarkdownContentSchema.parse(content);
};

export const getCVMDRequest: () => Promise<string> = async () => {
  const response = await fetch(routes.getCVMD());

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const content = await response.text();
  return MarkdownContentSchema.parse(content);
};
