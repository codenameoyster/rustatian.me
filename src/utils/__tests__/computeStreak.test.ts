import { describe, expect, it } from 'vitest';
import { computeStreak } from '../computeStreak';

// 2026-04-15 is a Wednesday (UTC). Use it as the anchor so tests can exercise
// GitHub's future-padding behavior (Thu-Fri-Sat appended with count=0).
const NOW = new Date('2026-04-15T12:00:00Z');

// Construct `count.length` days ending at NOW, one per previous UTC day.
const makeDays = (counts: number[]): Array<{ date: string; count: number }> => {
  return counts.map((count, i) => {
    const offset = counts.length - 1 - i;
    const ms = NOW.getTime() - offset * 86_400_000;
    return { date: new Date(ms).toISOString().slice(0, 10), count };
  });
};

// Append `padding` future-dated zero days (simulating GitHub's week padding).
const paddedDays = (counts: number[], padding: number): Array<{ date: string; count: number }> => {
  const real = makeDays(counts);
  const future = Array.from({ length: padding }, (_, i) => {
    const ms = NOW.getTime() + (i + 1) * 86_400_000;
    return { date: new Date(ms).toISOString().slice(0, 10), count: 0 };
  });
  return [...real, ...future];
};

describe('computeStreak', () => {
  it('returns 0 for an empty array', () => {
    expect(computeStreak([], NOW)).toBe(0);
  });

  it('returns 0 when every day has zero contributions', () => {
    expect(computeStreak(makeDays([0, 0, 0, 0, 0]), NOW)).toBe(0);
  });

  it('counts a single trailing active day', () => {
    expect(computeStreak(makeDays([0, 0, 0, 0, 3]), NOW)).toBe(1);
  });

  it('counts consecutive trailing active days', () => {
    expect(computeStreak(makeDays([0, 0, 2, 3, 1]), NOW)).toBe(3);
  });

  it('returns the full length when every day is active', () => {
    expect(computeStreak(makeDays([1, 1, 1, 1, 1]), NOW)).toBe(5);
  });

  it('does not break streak when today (last entry) has zero but yesterday is active', () => {
    // GitHub-style "pending today": today=0 but the rest of the streak is unbroken.
    expect(computeStreak(makeDays([0, 0, 1, 2, 1, 0]), NOW)).toBe(3);
  });

  it('breaks streak when both today and yesterday are zero', () => {
    expect(computeStreak(makeDays([0, 0, 1, 2, 0, 0]), NOW)).toBe(0);
  });

  it('ignores earlier runs and counts only the most recent', () => {
    expect(computeStreak(makeDays([1, 1, 1, 1, 1, 0, 0, 1, 2]), NOW)).toBe(2);
  });

  it('returns 0 for a single-element zero array', () => {
    expect(computeStreak(makeDays([0]), NOW)).toBe(0);
  });

  it('returns 1 for a single-element active array', () => {
    expect(computeStreak(makeDays([1]), NOW)).toBe(1);
  });

  // Regression: GitHub's GraphQL pads the final calendar week with zero-count
  // future days. A naive "skip one trailing zero" implementation misreads the
  // padding as broken-streak zeros on any non-Saturday view.
  it('ignores GitHub future-padded zeros (Wednesday-today view)', () => {
    // Real days ending at Wed (today) + Thu/Fri/Sat padded = 3 active days + 3 padded.
    expect(computeStreak(paddedDays([2, 3, 1], 3), NOW)).toBe(3);
  });

  it('ignores future-padded zeros in combination with pending-today semantics', () => {
    // Real days with today=0 (pending) + 4 padded future zeros.
    expect(computeStreak(paddedDays([1, 1, 1, 0], 4), NOW)).toBe(3);
  });

  it('handles a long active run followed by future padding', () => {
    // 10 consecutive active days ending today, then 3 padded zeros.
    expect(computeStreak(paddedDays(Array(10).fill(1), 3), NOW)).toBe(10);
  });

  it('returns 0 when the entire trailing padding plus today is zero', () => {
    // Active run earlier but today and a padded future zero → streak broken at today.
    // [active, active, today=0, tomorrow=0] → trim drops tomorrow → [a, a, 0] → 0 skipped (pending) → walk [a, a] → streak 2.
    expect(computeStreak(paddedDays([1, 1, 0], 1), NOW)).toBe(2);
  });
});
