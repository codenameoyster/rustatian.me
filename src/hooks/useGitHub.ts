import { useQuery } from '@tanstack/react-query';
import {
  getPinnedRepos,
  getPublicRepos,
  getUser,
  type Repo,
  WorkerApiError,
} from '@/api/githubRequests';
import { queryKeys } from '@/api/queryKeys';

export const useGitHubUser = () =>
  useQuery({
    queryKey: [queryKeys.GET_USER],
    queryFn: getUser,
    staleTime: 1000 * 60 * 5,
  });

export const usePinnedRepos = () =>
  useQuery({
    queryKey: [queryKeys.GET_PINNED_REPOS],
    queryFn: getPinnedRepos,
    staleTime: 1000 * 60 * 15,
    // If the worker has no token configured we get 503 TOKEN_UNAVAILABLE — do not retry.
    retry: (failureCount, error) => {
      if (error instanceof WorkerApiError && error.code === 'TOKEN_UNAVAILABLE') {
        return false;
      }
      return failureCount < 1;
    },
  });

export const usePublicRepos = (enabled: boolean) =>
  useQuery({
    queryKey: [queryKeys.GET_REPOS],
    queryFn: getPublicRepos,
    staleTime: 1000 * 60 * 10,
    enabled,
  });

export interface QueryLikeState {
  data?: Repo[] | undefined;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

export interface FeaturedReposState {
  data: Repo[] | undefined;
  isLoading: boolean;
  isError: boolean;
  source: 'pinned' | 'repos';
}

// Pure logic for the pinned → /repos fallback cascade. Extracted so it can be
// unit-tested without a React Query client — prod wrapper below injects the
// two React Query results.
export const computeFeaturedState = (
  pinned: QueryLikeState,
  fallback: QueryLikeState,
  limit: number,
): FeaturedReposState => {
  const pinnedHasItems = pinned.isSuccess && (pinned.data?.length ?? 0) > 0;
  const fallbackEnabled = pinned.isError || (pinned.isSuccess && (pinned.data?.length ?? 0) === 0);

  const source = pinnedHasItems ? pinned : fallback;
  const data = source.data
    ?.filter(r => r.description || r.stargazers_count > 0)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, limit);

  // Once the fallback has taken over, its state is what callers should see —
  // pinned's earlier success-with-empty or error doesn't make the page "fine".
  return {
    data,
    isLoading: pinned.isLoading || (fallbackEnabled && fallback.isLoading),
    isError: fallbackEnabled ? fallback.isError : pinned.isError,
    source: pinnedHasItems ? 'pinned' : 'repos',
  };
};

export const useFeaturedRepos = (limit = 6): FeaturedReposState => {
  const pinned = usePinnedRepos();
  const fallbackEnabled = pinned.isError || (pinned.isSuccess && pinned.data.length === 0);
  const fallback = usePublicRepos(fallbackEnabled);
  return computeFeaturedState(pinned, fallback, limit);
};
