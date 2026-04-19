import { z } from 'zod';
import { GraphQLResponseError, UpstreamRequestError } from './errors';

// GitHub's `contributionLevel` enum values mapped to our intensity scale.
// Keys are the exact GraphQL enum names — do not lowercase.
const LEVEL_MAP = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
} as const satisfies Record<string, 0 | 1 | 2 | 3 | 4>;

const ContributionLevelSchema = z.enum([
  'NONE',
  'FIRST_QUARTILE',
  'SECOND_QUARTILE',
  'THIRD_QUARTILE',
  'FOURTH_QUARTILE',
]);

// Validates GitHub's GraphQL response shape. A parse failure here surfaces
// schema drift (e.g. GitHub adds a new `contributionLevel` value) as a 502
// instead of silently coercing unknown enums to 0.
const GraphQLContributionResponseSchema = z.object({
  data: z
    .object({
      user: z
        .object({
          contributionsCollection: z
            .object({
              contributionCalendar: z
                .object({
                  totalContributions: z.number().int().nonnegative(),
                  weeks: z.array(
                    z.object({
                      contributionDays: z.array(
                        z.object({
                          date: z.string(),
                          contributionCount: z.number().int().nonnegative(),
                          contributionLevel: ContributionLevelSchema,
                        }),
                      ),
                    }),
                  ),
                })
                .optional(),
            })
            .optional(),
        })
        .nullable()
        .optional(),
    })
    .optional(),
  errors: z.array(z.object({ message: z.string() })).optional(),
});

export const CONTRIBUTIONS_QUERY = `query ContribCal($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            contributionLevel
          }
        }
      }
    }
  }
}`;

// Flattens GraphQL weeks → chronological day array (oldest first, today last).
// `gridCellsFromDays` and `computeStreak` on the client rely on this ordering.
// Must throw one of `UpstreamRequestError` (malformed / unexpected shape) or
// `GraphQLResponseError` (application error surfaced in `errors[]`) so the
// worker's catch block can surface each distinctly.
export const transformContributions = (rawBody: string): string => {
  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawBody);
  } catch {
    throw new UpstreamRequestError(502);
  }

  const result = GraphQLContributionResponseSchema.safeParse(parsedJson);
  if (!result.success) {
    throw new UpstreamRequestError(502);
  }

  if (result.data.errors && result.data.errors.length > 0) {
    throw new GraphQLResponseError(result.data.errors);
  }

  const calendar = result.data.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) {
    throw new UpstreamRequestError(502);
  }

  const days = calendar.weeks.flatMap(week =>
    week.contributionDays.map(day => ({
      date: day.date,
      count: day.contributionCount,
      level: LEVEL_MAP[day.contributionLevel],
    })),
  );
  return JSON.stringify({
    totalContributions: calendar.totalContributions,
    days,
  });
};
