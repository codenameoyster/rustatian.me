import { z } from 'zod';
import { WORKER_ERROR_CODES, type WorkerErrorCode } from './errorCodes';
import { routes } from './routes';

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

// Pinned repo is normalized by the worker into REST shape so /pinned and
// /repos flow through the same schema.
const RepoSchema = z.looseObject({
  name: z.string(),
  description: z.string().nullable(),
  html_url: z.url(),
  stargazers_count: z.number(),
  forks_count: z.number(),
  language: z.string().nullable(),
});
export type Repo = z.infer<typeof RepoSchema>;

const RepoListSchema = z.array(RepoSchema);

const WorkerApiErrorSchema = z.object({
  error: z.object({
    code: z.enum(WORKER_ERROR_CODES),
    message: z.string(),
    upstreamStatus: z.number().optional(),
    requestId: z.string(),
  }),
});

export class WorkerApiError extends Error {
  readonly code: WorkerErrorCode;
  readonly status: number;
  readonly requestId: string;

  constructor(status: number, code: WorkerErrorCode, message: string, requestId: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

const mapApiError = async (response: Response): Promise<Error> => {
  const fallbackMessage = `GitHub API error: ${response.status}`;

  try {
    const payload: unknown = await response.json();
    const parsed = WorkerApiErrorSchema.safeParse(payload);

    if (!parsed.success) {
      return new Error(fallbackMessage);
    }

    const { code, message, requestId } = parsed.data.error;
    return new WorkerApiError(response.status, code, message, requestId);
  } catch {
    return new Error(fallbackMessage);
  }
};

const fetchJson = async <T>(url: string, schema: z.ZodType<T>): Promise<T> => {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw await mapApiError(response);
  }

  const data: unknown = await response.json();
  return schema.parse(data);
};

export const getUser = async (): Promise<GitHubUser> =>
  fetchJson(routes.getGitHubUser(), GitHubUserSchema);

export const getPinnedRepos = async (): Promise<Repo[]> =>
  fetchJson(routes.getPinnedRepos(), RepoListSchema);

export const getPublicRepos = async (): Promise<Repo[]> =>
  fetchJson(routes.getPublicRepos(), RepoListSchema);
