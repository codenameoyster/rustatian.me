import { PROFILE_NAME, REPO_NAME } from '@/constants';
import { routes } from './routes';

interface IGetMarkdownDocumentData {
  type: string;
  encoding: string;
  size: number;
  name: string;
  path: string;
  content: string;
  sha: string;
  url: string;
  git_url: string;
  html_url: string;
  download_url: string;
  _links: {
    git: string;
    self: string;
    html: string;
  };
}

export const getMarkdownDocument: () => Promise<IGetMarkdownDocumentData> = async () => {
  const response = await fetch(routes.getReadmeMarkdownDocument(PROFILE_NAME, REPO_NAME));

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
};
