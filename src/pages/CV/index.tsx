import { getCVMDRequest } from '@/api/githubRequests';
import { queryKeys } from '@/api/queryKeys';
import { MarkdownDocumentContainer } from '@/components/MarkdownDocumentContainer/MarkdownDocumentContainer';
import { ArticleMD } from '@/components/MDTemplates';
import { Helmet } from 'react-helmet-async';
import { Box, Button } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { routes } from '@/api/routes';

export const CV = () => {
  const domain = import.meta.env.VITE_PUBLIC_WEBSITE_DOMAIN || 'https://rustatian.me';
  const domainUrl = new URL(domain);
  const ogImgUrl = new URL('og_default.png', domainUrl);

  return (
    <>
      <Helmet>
        <title>CV | rustatian.me</title>
        <meta name="description" content="Rustatian's CV." />
        <meta property="og:title" content="CV | rustatian.me" />
        <meta property="og:description" content="Rustatian's CV." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${domain}/cv`} />
        <meta property="og:image" content={ogImgUrl.href} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CV | rustatian.me" />
        <meta name="twitter:description" content="Rustatian's CV." />
        <meta name="twitter:image" content={ogImgUrl.href} />
        <link rel="canonical" href={`${domain}/cv`} />
      </Helmet>

      <Box>
        <MarkdownDocumentContainer
          request={getCVMDRequest}
          requestQueryKey={queryKeys.GET_CV_MD}
          MdTemplate={ArticleMD}
        />

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            href={routes.getCVMD()}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download CV
          </Button>
        </Box>
      </Box>
    </>
  );
};
