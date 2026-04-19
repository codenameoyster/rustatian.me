// GitHub's contribution calendar returns whole Sun–Sat weeks, padding the
// final week with zero-count future-dated days (e.g. Thu/Fri/Sat on a Wed
// view). Drop those so downstream logic (streak calculation, grid anchoring)
// doesn't mistake padding for "no contributions" and either break the streak
// or misplace today in the grid.
export const trimPaddedDays = <T extends { date: string }>(
  days: ReadonlyArray<T>,
  now: Date = new Date(),
): T[] => {
  const todayMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return days.filter(d => {
    const ms = Date.parse(`${d.date}T00:00:00Z`);
    return !Number.isNaN(ms) && ms <= todayMs;
  });
};
