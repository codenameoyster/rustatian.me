import { describe, expect, it } from 'vitest';
import { computeStreak } from '../computeStreak';

const makeDays = (counts: number[]): Array<{ count: number }> => counts.map(count => ({ count }));

describe('computeStreak', () => {
  it('returns 0 for an empty array', () => {
    expect(computeStreak([])).toBe(0);
  });

  it('returns 0 when every day has zero contributions', () => {
    expect(computeStreak(makeDays([0, 0, 0, 0, 0]))).toBe(0);
  });

  it('counts a single trailing active day', () => {
    expect(computeStreak(makeDays([0, 0, 0, 0, 3]))).toBe(1);
  });

  it('counts consecutive trailing active days', () => {
    expect(computeStreak(makeDays([0, 0, 2, 3, 1]))).toBe(3);
  });

  it('returns the full length when every day is active', () => {
    expect(computeStreak(makeDays([1, 1, 1, 1, 1]))).toBe(5);
  });

  it('does not break streak when today (last entry) has zero but yesterday is active', () => {
    // [ ..., active, active, active, today=0 ] — GitHub-style "pending today"
    expect(computeStreak(makeDays([0, 0, 1, 2, 1, 0]))).toBe(3);
  });

  it('breaks streak when both today and yesterday are zero', () => {
    expect(computeStreak(makeDays([0, 0, 1, 2, 0, 0]))).toBe(0);
  });

  it('ignores earlier runs and counts only the most recent', () => {
    expect(computeStreak(makeDays([1, 1, 1, 1, 1, 0, 0, 1, 2]))).toBe(2);
  });
});
