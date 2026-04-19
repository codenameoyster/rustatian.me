import { trimPaddedDays } from './trimPaddedDays';

export const computeStreak = (
  days: ReadonlyArray<{ date: string; count: number }>,
  now: Date = new Date(),
): number => {
  // GitHub's contribution calendar pads the final week with zero-count future
  // days (e.g. Thu/Fri/Sat on a Wednesday view). Those would otherwise read as
  // a broken streak, so drop them before scanning.
  const real = trimPaddedDays(days, now);
  if (real.length === 0) return 0;

  let i = real.length - 1;
  const last = real[i];

  // "Pending today": if today itself has no contributions yet, start counting
  // from yesterday so the streak doesn't visibly reset mid-day until midnight.
  if (last && last.count === 0) {
    i -= 1;
  }

  let streak = 0;
  while (i >= 0) {
    const day = real[i];
    if (!day || day.count === 0) break;
    streak += 1;
    i -= 1;
  }
  return streak;
};
