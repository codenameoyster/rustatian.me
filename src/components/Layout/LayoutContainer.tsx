import { useSetError } from '@state/appContext/appContext';
import { useQuery } from '@tanstack/react-query';
import type { ComponentChildren } from 'preact';
import { useEffect } from 'preact/hooks';
import { getUser } from '@/api/githubRequests';
import { queryKeys } from '@/api/queryKeys';
import { Layout } from './Layout';

interface LayoutContainerProps {
  children: ComponentChildren;
}

// Thin wrapper that keeps the global error store in sync with the user query.
// The actual user data is consumed inside <Layout /> via the same query key,
// so React Query dedupes the fetch.
export const LayoutContainer = ({ children }: LayoutContainerProps) => {
  const { isError, error } = useQuery({
    queryKey: [queryKeys.GET_USER],
    queryFn: getUser,
    staleTime: 1000 * 60 * 5,
  });

  const setError = useSetError();

  useEffect(() => {
    if (isError && error) {
      setError(error);
    }
  }, [isError, error, setError]);

  return <Layout>{children}</Layout>;
};
