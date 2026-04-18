export const computeStreak = (days: ReadonlyArray<{ count: number }>): number => {
  if (days.length === 0) return 0;

  let i = days.length - 1;
  const last = days[i];

  // "Pending today" accommodation: if the final entry has no contributions
  // yet, start counting from yesterday so today's pending state doesn't
  // reset the streak.
  if (last && last.count === 0) {
    i -= 1;
  }

  let streak = 0;
  while (i >= 0) {
    const day = days[i];
    if (!day || day.count === 0) break;
    streak += 1;
    i -= 1;
  }
  return streak;
};
