/* eslint-disable @typescript-eslint/no-unused-vars */
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Box, Card, Link, Typography, useTheme } from '@mui/material';
import { useMemo } from 'preact/hooks';

const MarkdownDocument = ({ children }) => {
  const theme = useTheme();

  const components = useMemo(
    () => ({
      h1: ({ node, ...props }) => <Typography variant="h3" gutterBottom {...props} />,
      h2: ({ node, ...props }) => <Typography variant="h4" gutterBottom {...props} />,
      h3: ({ node, ...props }) => <Typography variant="h5" gutterBottom {...props} />,
      p: ({ node, ...props }) => <Typography variant="body1" paragraph {...props} />,
      a: ({ node, ...props }) => <Link {...props} target="_blank" />,
      ul: ({ node, ...props }) => <Box component="ul" sx={{ pl: 3, mb: 2 }} {...props} />,
      ol: ({ node, ...props }) => <Box component="ol" sx={{ pl: 3, mb: 2 }} {...props} />,
      li: ({ node, ordered, ...props }) => (
        <Box
          component="li"
          sx={{
            typography: 'body1',
            mb: 1,
            listStyleType: ordered ? 'decimal' : 'disc',
          }}
          {...props}
        />
      ),
      code: ({ inline, children, ...props }) => (
        <Box
          component="code"
          sx={{
            backgroundColor:
              theme.palette.mode === 'dark'
                ? 'rgba(110, 118, 129, 0.4)'
                : 'rgba(175, 184, 193, 0.2)',
            color: 'inherit',
            borderRadius: '6px',
            fontFamily: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
            fontSize: '0.85em',
            px: 0.5,
            py: 0.25,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
          {...props}
        >
          {children}
        </Box>
      ),
    }),
    [theme],
  );

  return (
    <Card
      elevation={1}
      sx={{
        p: 3,
        bgcolor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
        borderRadius: 2,
        width: '100%',
        mt: 4,
      }}
    >
      <ReactMarkdown
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        remarkPlugins={[remarkGfm, remarkEmoji]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </Card>
  );
};

export default MarkdownDocument;
