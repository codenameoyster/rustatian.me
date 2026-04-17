import { queryKeys } from '@api/queryKeys';
import { useSetError, useSetUser } from '@state/appContext/appContext';
import { useQuery } from '@tanstack/react-query';
import type { ComponentChildren } from 'preact';
import { useEffect } from 'preact/hooks';
import { getUser } from '@/api/githubRequests';
import { Layout } from './Layout';

interface ILayoutContainerProps {
  children: ComponentChildren;
}

export const LayoutContainer = ({ children }: ILayoutContainerProps) => {
  const { data, isError, error } = useQuery({
    queryKey: [queryKeys.GET_USER],
    queryFn: () => getUser(),
    staleTime: 1000 * 60 * 5,
  });

  const setError = useSetError();
  const setUser = useSetUser();

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

  return <Layout>{children}</Layout>;
};
