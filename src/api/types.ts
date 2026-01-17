// Re-export the Zod-inferred type as the primary user type
// This ensures type safety through runtime validation
export type { GitHubUser as IBaseUser } from './githubRequests';

interface IPlan {
  collaborators: number;
  name: string;
  space: number;
  private_repos: number;
}

// Extended user types for future use if needed
interface IPublicUser {
  private_gists: number;
  total_private_repos: number;
  owned_private_repos: number;
  disk_usage: number;
  collaborators: number;
  plan?: IPlan;
}

interface IPrivateUser extends IPublicUser {
  two_factor_authentication: boolean;
  business_plus?: boolean;
  ldap_dn?: string;
}

export type IGitHubUser = IPrivateUser | IPublicUser;
