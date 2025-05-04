import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';
import rehypeRaw from 'rehype-raw';
import { Divider, Link, List, ListItem, Paper, Typography, useTheme } from '@mui/material';

const MarkdownDocument = ({children}) => {
  const theme = useTheme();

  const components = {
    h1: ({ node, ...props }) => <Typography variant="h1" gutterBottom {...props} />,
    h2: ({ node, ...props }) => <Typography variant="h2" gutterBottom {...props} />,
    h3: ({ node, ...props }) => <Typography variant="h3" gutterBottom {...props} />,
    p: ({ node, ...props }) => <Typography variant="body1" {...props} />,
    a: ({ node, ...props }) => (
      <Link
        color={theme.palette.mode === 'dark' ? 'primary.light' : 'primary.main'} 
        underline="hover" 
        {...props} 
      />
    ),
    ul: ({ node, ...props }) => <List dense sx={{ pl: 4 }} {...props} />,
    ol: ({ node, ...props }) => <List component="ol" dense sx={{ pl: 4 }} {...props} />,
    li: ({ node, ...props }) => <ListItem disableGutters component="li" {...props} />,
    hr: ({ node, ...props }) => <Divider sx={{ my: 3 }} {...props} />,
    code: ({ node, inline, ...props }) => inline ? (
      <Paper 
        component="span" 
        elevation={0} 
        sx={{ 
          display: 'inline-block',
          bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.100',
          px: 0.5,
          borderRadius: 1,
          fontFamily: 'monospace'
        }}
        {...props}
      />
    ) : (
      <Paper 
        elevation={0} 
        sx={{ 
          bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.100',
          borderRadius: 2,
          overflow: 'auto'
        }}
      >
        <Typography component="pre" fontFamily="monospace" {...props} />
      </Paper>
    )
  };

  return (
    <ReactMarkdown
      components={components}
      remarkPlugins={[remarkGfm, remarkEmoji]}
      rehypePlugins={[rehypeRaw]}
    >
      {children}
    </ReactMarkdown>
  );
};

export default MarkdownDocument;
