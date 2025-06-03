import { getBlogInnerMd } from '@/api/githubRequests';
import { queryKeys } from '@/api/queryKeys';
import { MarkdownDocumentContainer } from '@/components/MarkdownDocumentContainer/MarkdownDocumentContainer';
import { ArticleMD } from '@/components/MDTemplates';
import { useLocation } from 'preact-iso';

export const ExternalPost = () => {
  const { path } = useLocation();

  const queryKey = [queryKeys.GET_BLOG_MD, path];
  const slug = path.replace(/^\/blog/, '');

  return (
    <MarkdownDocumentContainer
      request={() => getBlogInnerMd(slug)}
      requestQueryKey={queryKey}
      MdTemplate={ArticleMD}
      basePath={slug}
    />
  );
};
