import { getBlogInnerMd } from '@/api/githubRequests';
import { queryKeys } from '@/api/queryKeys';
import { MarkdownDocumentContainer } from '@/components/MarkdownDocumentContainer/MarkdownDocumentContainer';
import { ArticleMD } from '@/components/MDTemplates';
import { BLOG_SUBDIRECTORY } from '@/constants';
import { useLocation } from 'preact-iso';
import { Helmet } from 'react-helmet-async';

export const ExternalPost = () => {
  const { path } = useLocation();

  const queryKey = [queryKeys.GET_BLOG_MD, path];
  const slug = path.replace(/^\/blog/, '');

  const domain = import.meta.env.VITE_PUBLIC_WEBSITE_DOMAIN || 'https://rustatian.me';
  const blogUrl = new URL(BLOG_SUBDIRECTORY, domain);
  const ogBlogImgUrl = new URL('og_blog.png', domain);

  return (
    <>
      <Helmet>
        <title>Blog | rustatian.me</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta
          name="description"
          content="Read articles about programming, Rust, open-source, and software engineering on the rustatian.me blog."
        />
        <meta property="og:title" content="Blog | rustatian.me" />
        <meta
          property="og:description"
          content="Read articles about programming, Rust, open-source, and software engineering on the rustatian.me blog."
        />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={ogBlogImgUrl.href} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog | rustatian.me" />
        <meta
          name="twitter:description"
          content="Read articles about programming, Rust, open-source, and software engineering on the rustatian.me blog."
        />
        <meta name="twitter:image" content={ogBlogImgUrl.href} />
        <link rel="canonical" href={blogUrl.href} />
      </Helmet>

      <MarkdownDocumentContainer
        request={() => getBlogInnerMd(slug)}
        requestQueryKey={queryKey}
        MdTemplate={ArticleMD}
        basePath={slug}
      />
    </>
  );
};
