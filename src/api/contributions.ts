import { z } from 'zod';
import { fetchJson } from './fetchJson';
import { routes } from './routes';

const ContribDaySchema = z.object({
  date: z.string(),
  count: z.number().int().nonnegative(),
  level: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});
export type ContribDay = z.infer<typeof ContribDaySchema>;
export type Level = ContribDay['level'];

const ContributionsSchema = z.object({
  totalContributions: z.number().int().nonnegative(),
  days: z.array(ContribDaySchema),
});
export type Contributions = z.infer<typeof ContributionsSchema>;

export const getContributions = async (): Promise<Contributions> =>
  fetchJson(routes.getGitHubContributions(), ContributionsSchema);
