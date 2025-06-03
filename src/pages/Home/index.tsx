import { getUserReadmeMDRequest } from '@/api/githubRequests';
import { queryKeys } from '@/api/queryKeys';
import { MarkdownDocumentContainer } from '@/components/MarkdownDocumentContainer/MarkdownDocumentContainer';
import { AboutMeMD } from '@/components/MDTemplates';
import { StatsContainer } from '@/components/StatsContainer/StatsContainer';
import { Title } from '@/components/Title/Title';
import { Box } from '@mui/material';

export const Home = () => {
  return (
    <Box>
      <Title>About Me</Title>

      <MarkdownDocumentContainer
        request={getUserReadmeMDRequest}
        requestQueryKey={queryKeys.GET_USER_README_MD}
        MdTemplate={AboutMeMD}
      />

      <StatsContainer />
    </Box>
  );
};
