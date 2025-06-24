import { getUserReadmeMDRequest } from '@/api/githubRequests';
import { queryKeys } from '@/api/queryKeys';
import { MarkdownDocumentContainer } from '@/components/MarkdownDocumentContainer/MarkdownDocumentContainer';
import { AboutMeMD } from '@/components/MDTemplates';
import { StatsContainer } from '@/components/StatsContainer/StatsContainer';
import { Helmet } from 'react-helmet-async';
import { Box } from '@mui/material';

export const Home = () => {
  const domain = import.meta.env.VITE_PUBLIC_WEBSITE_DOMAIN || 'https://rustatian.me';
  const domainUrl = new URL(domain);
  const ogImgUrl = new URL('og_default.png', domainUrl);

  return (
    <>
      <Helmet>
        <title>About Me | rustatian.me</title>
        <meta
          name="description"
          content="Discover more about Rustatian: skills, experience, open-source projects, and stats. Stay updated with the latest achievements and contributions."
        />
        <meta property="og:title" content="About Me | rustatian.me" />
        <meta
          property="og:description"
          content="Discover more about Rustatian: skills, experience, open-source projects, and stats."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={domainUrl.origin} />
        <meta property="og:image" content={ogImgUrl.href} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Me | rustatian.me" />
        <meta
          name="twitter:description"
          content="Discover more about Rustatian: skills, experience, open-source projects, and stats."
        />
        <meta name="twitter:image" content={ogImgUrl.href} />
        <link rel="canonical" href={domain} />
      </Helmet>

      <Box>
        <MarkdownDocumentContainer
          request={getUserReadmeMDRequest}
          requestQueryKey={queryKeys.GET_USER_README_MD}
          MdTemplate={AboutMeMD}
        />

        <StatsContainer />
      </Box>
    </>
  );
};
