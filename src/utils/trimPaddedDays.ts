const DAY_MS = 86_400_000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const toIsoDate = (ms: number): string => new Date(ms).toISOString().slice(0, 10);

// Drops days the calendar can't legitimately contain yet, so downstream logic
// (streak calculation, grid anchoring) doesn't mistake them for real entries.
//
// The cutoff allows one day of slack past UTC today: GitHub keys the calendar to
// the *profile's* own timezone (its contributionsCollection window runs local
// midnight to local midnight), so its date strings are local dates that can run
// ahead of the UTC date by up to the maximum offset of UTC+14. Comparing against
// UTC today alone discarded the genuine current day for eastward profiles.
//
// Dates are YYYY-MM-DD, which sorts chronologically, so this compares strings
// rather than parsing 700-odd Dates on every call.
export const trimPaddedDays = <T extends { date: string }>(
  days: ReadonlyArray<T>,
  now: Date = new Date(),
): T[] => {
  const utcToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const cutoff = toIsoDate(utcToday + DAY_MS);
  return days.filter(day => ISO_DATE.test(day.date) && day.date <= cutoff);
};
