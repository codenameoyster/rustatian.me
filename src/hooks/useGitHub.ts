import { useQuery } from '@tanstack/react-query';
import { getUser } from '@/api/githubRequests';
import { queryKeys } from '@/api/queryKeys';

export const useGitHubUser = () =>
  useQuery({
    queryKey: [queryKeys.GET_USER],
    queryFn: getUser,
    staleTime: 1000 * 60 * 5,
  });
