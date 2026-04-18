import { useQuery } from '@tanstack/react-query';
import { getPinnedRepos, getPublicRepos, getUser, WorkerApiError } from '@/api/githubRequests';
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

// Pinned first, with a graceful fallback to /repos. Consumers get a single
// list, the top N by stars, regardless of which upstream returned it.
export const useFeaturedRepos = (limit = 6) => {
  const pinned = usePinnedRepos();
  const fallbackEnabled = pinned.isError || (pinned.isSuccess && pinned.data.length === 0);
  const fallback = usePublicRepos(fallbackEnabled);

  const source = pinned.isSuccess && pinned.data.length > 0 ? pinned : fallback;
  const data = source.data
    ?.filter(r => r.description || r.stargazers_count > 0)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, limit);

  return {
    data,
    isLoading: pinned.isLoading || (fallbackEnabled && fallback.isLoading),
    isError: pinned.isError && fallback.isError,
    source: pinned.isSuccess && pinned.data.length > 0 ? ('pinned' as const) : ('repos' as const),
  };
};
