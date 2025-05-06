const githubApiHost = () => 'https://api.github.com';

export const routes = {
  getReadmeMarkdownDocument: (owner, repo) =>
    `${githubApiHost()}/repos/${owner}/${repo}/contents/README.md`,
};
