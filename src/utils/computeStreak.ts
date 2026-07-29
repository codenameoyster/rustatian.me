import { trimPaddedDays } from './trimPaddedDays';

const DAY_MS = 86_400_000;

const toUtcMs = (isoDate: string): number => Date.parse(`${isoDate}T00:00:00Z`);

export const computeStreak = (
  days: ReadonlyArray<{ date: string; count: number }>,
  now: Date = new Date(),
): number => {
  const real = trimPaddedDays(days, now);
  const last = real[real.length - 1];
  if (!last) return 0;

  if (Number.isNaN(toUtcMs(last.date))) return 0;

  const todayMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  let i = real.length - 1;

  // Skip trailing zeros that aren't in the past yet — today's own zero, because
  // the day isn't over, and any future-dated entry. A zero on a *past* day is a
  // real break and must not be skipped: the payload is edge-cached for 24h and
  // served to browsers with a day-long max-age, so it routinely ends on an
  // earlier date. Treating that stale zero as "pending" reported streaks that
  // had already ended days ago.
  while (i >= 0) {
    const day = real[i];
    if (!day || day.count !== 0) break;

    const dayMs = toUtcMs(day.date);
    if (Number.isNaN(dayMs) || dayMs < todayMs) break;

    i -= 1;
  }

  // Walk backwards requiring calendar-consecutive dates. Index adjacency alone
  // isn't enough: any gap in the payload — an omitted day, or one dropped by
  // `trimPaddedDays` for a malformed date — would otherwise be counted straight
  // through as if the streak were unbroken.
  let streak = 0;
  let expectedMs = i >= 0 ? toUtcMs(real[i]?.date ?? '') : Number.NaN;

  while (i >= 0) {
    const day = real[i];
    if (!day || day.count === 0) break;

    const dayMs = toUtcMs(day.date);
    if (Number.isNaN(dayMs) || dayMs !== expectedMs) break;

    streak += 1;
    expectedMs = dayMs - DAY_MS;
    i -= 1;
  }

  return streak;
};
