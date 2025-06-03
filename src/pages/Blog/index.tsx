import { getBlogSummaryMdRequest } from '@/api/githubRequests';
import { queryKeys } from '@/api/queryKeys';
import { MarkdownDocumentContainer } from '@/components/MarkdownDocumentContainer/MarkdownDocumentContainer';
import { ArticleMD } from '@/components/MDTemplates';

export const Blog = () => {
  return (
    <MarkdownDocumentContainer
      request={getBlogSummaryMdRequest}
      requestQueryKey={queryKeys.GET_BLOG_SUMMARY_MD}
      MdTemplate={ArticleMD}
    />
  );
};
