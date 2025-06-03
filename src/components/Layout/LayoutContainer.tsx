import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@api/queryKeys';
import { ComponentChildren } from 'preact';
import { useSetError } from '@state/appContext/appContext';
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
  });

  const setError = useSetError();

  useEffect(() => {
    if (isError) {
      setError(error);
    }
  }, [isError, error, setError]);

  if (isLoading) return <DelayedSpinner />;
  if (isError || !data) return null;

  return <Layout>{children}</Layout>;
};
