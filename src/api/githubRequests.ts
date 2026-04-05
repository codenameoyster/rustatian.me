import { PROFILE_NAME, PROFILE_REPO_NAME, PROFILE_BRANCH } from '@/constants';
import { routes } from './routes';
import { z } from 'zod';

// Zod schema for GitHub user validation
// Using looseObject to allow extra fields from API while validating required ones
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

// Infer the type from Zod schema - no manual type assertion needed
export type GitHubUser = z.infer<typeof GitHubUserSchema>;

// Maximum markdown content size: 10MB
const MarkdownContentSchema = z.string().max(10 * 1024 * 1024);
const WorkerApiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    upstreamStatus: z.number().optional(),
    requestId: z.string(),
  }),
});

const mapApiError = async (response: Response): Promise<Error> => {
  const fallbackMessage = `GitHub API error: ${response.status}`;

  try {
    const payload: unknown = await response.json();
    const parsed = WorkerApiErrorSchema.safeParse(payload);

    if (!parsed.success) {
      return new Error(fallbackMessage);
    }

    const { message, requestId } = parsed.data.error;
    return new Error(`${message} [requestId=${requestId}]`);
  } catch {
    return new Error(fallbackMessage);
  }
};

const fetchJson = async <T>(url: string, schema: z.ZodType<T>): Promise<T> => {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw await mapApiError(response);
  }

  const data: unknown = await response.json();
  return schema.parse(data);
};

const fetchText = async (url: string, schema: z.ZodString): Promise<string> => {
  const response = await fetch(url, {
    headers: {
      Accept: 'text/plain',
    },
  });

  if (!response.ok) {
    throw await mapApiError(response);
  }

  const content = await response.text();
  return schema.parse(content);
};

export const getUser = async (): Promise<GitHubUser> => {
  return fetchJson(routes.getGitHubUser(), GitHubUserSchema);
};

export const getUserReadmeMDRequest: () => Promise<string> = async () => {
  return fetchText(
    routes.getOwnerReadmeMD(PROFILE_NAME, PROFILE_REPO_NAME, PROFILE_BRANCH),
    MarkdownContentSchema,
  );
};

export const getBlogSummaryMdRequest: () => Promise<string> = async () => {
  return fetchText(routes.getBlogSummaryMd(), MarkdownContentSchema);
};

export const getBlogInnerMd: (path: string) => Promise<string> = async path => {
  const route = routes.getBlogInnerMd({ endPath: path });
  return fetchText(route, MarkdownContentSchema);
};
