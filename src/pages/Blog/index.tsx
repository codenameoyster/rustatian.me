import { getBlogSummaryMdRequest } from '@/api/githubRequests';
import { queryKeys } from '@/api/queryKeys';
import { MarkdownDocumentContainer } from '@/components/MarkdownDocumentContainer/MarkdownDocumentContainer';
import { ArticleMD } from '@/components/MDTemplates';
import { BLOG_SUBDIRECTORY } from '@/constants';
import { Helmet } from 'react-helmet-async';

export const Blog = () => {
  const domain = import.meta.env.VITE_PUBLIC_WEBSITE_DOMAIN || 'https://rustatian.me';
  const domainUrl = new URL(domain);
  const ogImgUrl = new URL('og_blog.png', domainUrl);
  const blogUrl = new URL(BLOG_SUBDIRECTORY, domain);

  return (
    <>
      <Helmet>
        <title>Blog | rustatian.me</title>
        <meta
          name="description"
          content="Read articles about programming, Rust, open-source, and software engineering on the rustatian.me blog."
        />
        <meta property="og:title" content="Blog | rustatian.me" />
        <meta
          property="og:description"
          content="Read articles about programming, Rust, open-source, and software engineering on the rustatian.me blog."
        />
        <meta property="og:type" content="blog" />
        <meta property="og:url" content={blogUrl.href} />
        <meta property="og:image" content={ogImgUrl.href} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog | rustatian.me" />
        <meta
          name="twitter:description"
          content="Read articles about programming, Rust, open-source, and software engineering on the rustatian.me blog."
        />
        <meta name="twitter:image" content={ogImgUrl.href} />
        <link rel="canonical" href={blogUrl.href} />
      </Helmet>

      <MarkdownDocumentContainer
        request={getBlogSummaryMdRequest}
        requestQueryKey={queryKeys.GET_BLOG_SUMMARY_MD}
        MdTemplate={ArticleMD}
      />
    </>
  );
};
