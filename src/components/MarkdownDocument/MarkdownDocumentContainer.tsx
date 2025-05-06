import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@api/queryKeys';
import { getMarkdownDocument } from '@api/githubRequests';
import { DocumentSkeleton } from '@components/Loaders/DocumentSkeleton';
import { useSetError } from '@state/appContext/appContext';
import { useEffect } from 'preact/hooks';
import MarkdownDocument from './MarkdownDocument';
import { decodeBase64 } from '@/utils/decodeBase64';

export const MarkdownDocumentContainer = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [queryKeys.GET_README_MARKDOWN_DOCUMENT],
    queryFn: () => getMarkdownDocument(),
  });

  const setError = useSetError();

  if (isLoading) return <DocumentSkeleton />;

  useEffect(() => {
    if (isError) {
      setError(error);
    }
  }, [isError, error]);

  if (isError) {
    return null;
  }

  const decodedContent = decodeBase64(data.content);

  return <MarkdownDocument>{decodedContent}</MarkdownDocument>;
};
