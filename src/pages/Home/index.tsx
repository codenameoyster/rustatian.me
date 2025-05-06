import { usePageMetadata } from '@/hooks/usePageMetadata';
import { MarkdownDocumentContainer } from '@components/MarkdownDocument/MarkdownDocumentContainer';

export const Home = () => {
  usePageMetadata({ title: 'About' });

  return <MarkdownDocumentContainer />;
};
