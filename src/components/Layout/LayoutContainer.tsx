import { useSetError } from '@state/appContext/appContext';
import type { ComponentChildren } from 'preact';
import { useEffect } from 'preact/hooks';
import { useGitHubUser } from '@/hooks/useGitHub';
import { Layout } from './Layout';

interface LayoutContainerProps {
  children: ComponentChildren;
}

// Thin wrapper that keeps the global error store in sync with the user query.
// The actual user data is consumed inside <Layout /> via the same React Query
// key, so the two calls dedupe to one fetch.
export const LayoutContainer = ({ children }: LayoutContainerProps) => {
  const { isError, error } = useGitHubUser();

  const setError = useSetError();

  useEffect(() => {
    if (isError && error) {
      setError(error);
    }
  }, [isError, error, setError]);

  return <Layout>{children}</Layout>;
};
