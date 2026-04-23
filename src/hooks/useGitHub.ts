import { useQuery } from '@tanstack/react-query';
import type { Contributions } from '@/api/contributions';
import { getContributions } from '@/api/contributions';
import type { NetworkError, WorkerApiError } from '@/api/fetchJson';
import type { GitHubUser } from '@/api/githubRequests';
import { getUser } from '@/api/githubRequests';
import { queryKeys } from '@/api/queryKeys';

// Explicit error generic so `WorkerApiError.code`, `NetworkError.kind`, etc.
// survive the trip through React Query instead of being flattened to `Error`.
// Consumers narrow with `instanceof` to show discriminated UX (retry button
// for network errors, upstream-specific text for 502s).
type QueryError = WorkerApiError | NetworkError | Error;

export const useGitHubUser = () =>
  useQuery<GitHubUser, QueryError>({
    queryKey: [queryKeys.GET_USER],
    queryFn: getUser,
    staleTime: 1000 * 60 * 5,
  });

export const useGitHubContributions = () =>
  useQuery<Contributions, QueryError>({
    queryKey: [queryKeys.GET_CONTRIBUTIONS],
    queryFn: getContributions,
    // Matches the worker's 24h edge-cache TTL: React Query stays fresh for the
    // same window, so tab switches within a day don't trigger redundant fetches
    // that would just hit the worker's cache.
    staleTime: 1000 * 60 * 60 * 24,
  });
