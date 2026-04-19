import { useQuery } from '@tanstack/react-query';
import { getContributions } from '@/api/contributions';
import { getUser } from '@/api/githubRequests';
import { queryKeys } from '@/api/queryKeys';

export const useGitHubUser = () =>
  useQuery({
    queryKey: [queryKeys.GET_USER],
    queryFn: getUser,
    staleTime: 1000 * 60 * 5,
  });

export const useGitHubContributions = () =>
  useQuery({
    queryKey: [queryKeys.GET_CONTRIBUTIONS],
    queryFn: getContributions,
    // Matches the worker's 1-hour edge-cache TTL so React Query doesn't
    // trigger redundant refetches within the window where the worker would
    // just serve the same cached payload.
    staleTime: 1000 * 60 * 60,
  });
