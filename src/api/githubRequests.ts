import { z } from 'zod';
import { fetchJson, WorkerApiError } from './fetchJson';
import { routes } from './routes';

export { WorkerApiError };

// Loose so GitHub adding new fields doesn't break parsing — only the ones
// we actually consume are validated. Tightening this would couple the client
// to every upstream schema bump.
const GitHubUserSchema = z.looseObject({
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
});
export type GitHubUser = z.infer<typeof GitHubUserSchema>;

export const getUser = async (): Promise<GitHubUser> =>
  fetchJson(routes.getGitHubUser(), GitHubUserSchema);
