interface IPlan {
  collaborators: number;
  name: string;
  space: number;
  private_repos: number;
}

interface IBaseUser {
  login: string;
  id: number;
  user_view_type?: string;
  node_id: string;
  avatar_url: string;
  gravatar_id: string | null;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  notification_email: string | null;
  hireable: boolean | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  plan?: IPlan;
}

interface IPublicUser extends IBaseUser {
  private_gists: number;
  total_private_repos: number;
  owned_private_repos: number;
  disk_usage: number;
  collaborators: number;
}

interface IPrivateUser extends IPublicUser {
  two_factor_authentication: boolean;
  business_plus?: boolean;
  ldap_dn?: string;
}

export type IGitHubUser = IPrivateUser | IPublicUser;
