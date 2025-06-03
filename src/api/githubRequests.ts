import { PROFILE_NAME, PROFILE_REPO_NAME, PROFILE_BRANCH } from '@/constants';
import { routes } from './routes';
import { IGitHubUser } from './types';

export const getUser: () => Promise<IGitHubUser> = async () => {
  const response = await fetch(routes.getGitHubUser());

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
};

export const getUserReadmeMDRequest: () => Promise<string> = async () => {
  const response = await fetch(
    routes.getOwnerReadmeMD(PROFILE_NAME, PROFILE_REPO_NAME, PROFILE_BRANCH),
  );

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.text();
};

export const getBlogSummaryMdRequest: () => Promise<string> = async () => {
  const response = await fetch(routes.getBlogSummaryMd());

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.text();
};

export const getBlogInnerMd: (path: string) => Promise<string> = async path => {
  const route = routes.getBlogInnerMd({ endPath: path });

  const response = await fetch(route);

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.text();
};
