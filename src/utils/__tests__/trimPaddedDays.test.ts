import { describe, expect, it } from 'vitest';
import { trimPaddedDays } from '../trimPaddedDays';

const NOW = new Date('2026-04-15T12:00:00Z'); // Wednesday

describe('trimPaddedDays', () => {
  it('returns the array unchanged when no days are in the future', () => {
    const days = [
      { date: '2026-04-13', count: 2 },
      { date: '2026-04-14', count: 1 },
      { date: '2026-04-15', count: 0 },
    ];
    expect(trimPaddedDays(days, NOW)).toEqual(days);
  });

  it('drops days dated after the UTC day of `now`', () => {
    const days = [
      { date: '2026-04-13', count: 2 },
      { date: '2026-04-14', count: 1 },
      { date: '2026-04-15', count: 0 },
      { date: '2026-04-16', count: 0 },
      { date: '2026-04-17', count: 0 },
      { date: '2026-04-18', count: 0 },
    ];
    const trimmed = trimPaddedDays(days, NOW);
    expect(trimmed).toHaveLength(3);
    expect(trimmed[trimmed.length - 1]?.date).toBe('2026-04-15');
  });

  it('keeps today itself (inclusive of the UTC day boundary)', () => {
    const days = [{ date: '2026-04-15', count: 5 }];
    expect(trimPaddedDays(days, NOW)).toEqual(days);
  });

  it('drops days with unparseable dates rather than keeping them', () => {
    const days = [
      { date: '2026-04-14', count: 1 },
      { date: 'not-a-date', count: 99 },
      { date: '2026-04-15', count: 2 },
    ];
    const trimmed = trimPaddedDays(days, NOW);
    expect(trimmed).toEqual([
      { date: '2026-04-14', count: 1 },
      { date: '2026-04-15', count: 2 },
    ]);
  });

  it('is a no-op on an empty array', () => {
    expect(trimPaddedDays([], NOW)).toEqual([]);
  });

  it('preserves the extra fields of the day records', () => {
    const days = [
      { date: '2026-04-14', count: 1, level: 1 as const },
      { date: '2026-04-16', count: 0, level: 0 as const },
    ];
    const trimmed = trimPaddedDays(days, NOW);
    expect(trimmed).toEqual([{ date: '2026-04-14', count: 1, level: 1 }]);
  });
});
