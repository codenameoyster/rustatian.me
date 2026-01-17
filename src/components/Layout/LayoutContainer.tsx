import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@api/queryKeys';
import { ComponentChildren } from 'preact';
import { useSetError, useSetUser } from '@state/appContext/appContext';
import { useEffect } from 'preact/hooks';
import { Layout } from './Layout';
import { getUser } from '@/api/githubRequests';
import { DelayedSpinner } from '../DelaySpinner/DelaySpinner';

interface ILayoutContainerProps {
  children: ComponentChildren;
}

export const LayoutContainer = ({ children }: ILayoutContainerProps) => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [queryKeys.GET_USER],
    queryFn: () => getUser(),
    staleTime: 1000 * 60 * 5, // 5 minutes - reduce unnecessary refetches
  });

  const setError = useSetError();
  const setUser = useSetUser();

  // Sync user data to context for components that need it
  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data, setUser]);

  useEffect(() => {
    if (isError && error) {
      setError(error);
    }
  }, [isError, error, setError]);

  if (isLoading) return <DelayedSpinner />;
  if (isError || !data) return null;

  return <Layout>{children}</Layout>;
};
