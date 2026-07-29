import { useQuery } from '@tanstack/react-query';
import { CACHE_TTL_SECONDS } from '@/api/cachePolicy';
import type { Contributions } from '@/api/contributions';
import { getContributions } from '@/api/contributions';
import type { NetworkError, WorkerApiError } from '@/api/fetchJson';
import type { GitHubUser } from '@/api/githubRequests';
import { getUser } from '@/api/githubRequests';

// Union with `Error` collapses to `Error` for assignability, so this buys no
// narrowing on its own — it exists so a consumer that *does* want to branch on
// `WorkerApiError.code` or `NetworkError.kind` can, without a cast.
type QueryError = WorkerApiError | NetworkError | Error;

// Retaining past the last observer is browser-only on purpose. React Query's
// server default is `Infinity`, which schedules no timer; any finite value
// passes its `isValidTimeout` check and schedules a bare `setTimeout` with no
// `unref`, which keeps Node's event loop alive and hangs the SSG prerender pass
// (the prerender does mount these queries). A previous attempt at this had to be
// reverted for exactly that reason.
const clientGcTime = (ms: number) => (typeof window === 'undefined' ? {} : { gcTime: ms });

export const useGitHubUser = () =>
  useQuery<GitHubUser, QueryError>({
    queryKey: ['github-user'],
    queryFn: getUser,
    staleTime: CACHE_TTL_SECONDS.user * 1000,
    ...clientGcTime(CACHE_TTL_SECONDS.user * 1000),
  });

export const useGitHubContributions = () =>
  useQuery<Contributions, QueryError>({
    queryKey: ['github-contributions'],
    queryFn: getContributions,
    staleTime: CACHE_TTL_SECONDS.contributions * 1000,
    // Without this the entry is garbage-collected 5 minutes after Home unmounts,
    // so navigating to /about and back refetches and re-renders the skeleton —
    // defeating the whole point of the long staleTime.
    ...clientGcTime(CACHE_TTL_SECONDS.contributions * 1000),
  });
