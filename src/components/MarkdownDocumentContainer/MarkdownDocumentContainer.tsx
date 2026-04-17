import { queryKeys } from '@api/queryKeys';
import { Box, CircularProgress, Fade } from '@mui/material';
import { useSetError } from '@state/appContext/appContext';
import { useQuery } from '@tanstack/react-query';
import type { FunctionalComponent } from 'preact';
import { useEffect } from 'preact/hooks';

interface IData {
  text: string;
  basePath: string;
}

interface IMarkdownDocumentContainerProps {
  request: (params?: unknown) => Promise<string>;
  requestQueryKey?: string | string[];
  MdTemplate: FunctionalComponent<IData>;
  basePath?: string;
}

export const MarkdownDocumentContainer = ({
  request,
  requestQueryKey = queryKeys.DEFAULT,
  MdTemplate,
  basePath = '',
}: IMarkdownDocumentContainerProps) => {
  const queryKey = Array.isArray(requestQueryKey) ? requestQueryKey : [requestQueryKey];

  const { data, isLoading, isError, error, isFetched } = useQuery({
    queryKey,
    queryFn: () => request(),
  });

  const setError = useSetError();

  useEffect(() => {
    if (isError) {
      setError(error ?? new Error('Unknown error'));
    } else if (isFetched && !data) {
      setError(new Error('Document not received'));
    }
  }, [isError, isFetched, data, error, setError]);

  return (
    <>
      {isLoading && (
        <Box
          sx={{
            width: '100%',
            py: 6,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {!isLoading && data && (
        <Fade in timeout={600}>
          <div>
            <MdTemplate text={data} basePath={basePath} />
          </div>
        </Fade>
      )}
    </>
  );
};
