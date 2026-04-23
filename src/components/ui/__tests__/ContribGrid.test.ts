import { describe, expect, it } from 'vitest';
import { gridCellsFromDays } from '../ContribGrid';

describe('gridCellsFromDays', () => {
  // Use a fixed "now" for every test so padding trimming is deterministic.
  // 2026-04-18 is a Saturday (UTC day-of-week 6).
  const SAT = new Date('2026-04-18T12:00:00Z');

  it('returns 371 empty cells for an empty days array', () => {
    const cells = gridCellsFromDays([], SAT);
    expect(cells).toHaveLength(371);
    expect(cells.every(c => c.level === 0)).toBe(true);
  });

  it('places the anchor (last) day in the last column at its day-of-week row', () => {
    // 2026-04-18 Saturday. Grid row=6, col=52 → DOM index = 6 * 53 + 52 = 370.
    const cells = gridCellsFromDays([{ date: '2026-04-18', count: 5, level: 4 }], SAT);
    expect(cells[370]?.level).toBe(4);
    const filled = cells.filter(c => c.level !== 0);
    expect(filled).toHaveLength(1);
  });

  it('places a Wednesday anchor at row 3, col 52', () => {
    // 2026-04-15 is a Wednesday (dow=3). DOM index = 3 * 53 + 52 = 211.
    const wed = new Date('2026-04-15T12:00:00Z');
    const cells = gridCellsFromDays([{ date: '2026-04-15', count: 2, level: 2 }], wed);
    expect(cells[211]?.level).toBe(2);
  });

  it('places a Sunday anchor at row 0, col 52 (edge: dow=0)', () => {
    // 2026-04-12 is a Sunday (dow=0). DOM index = 0 * 53 + 52 = 52.
    // This is the boundary that would expose off-by-one in anchorColMajor math.
    const sun = new Date('2026-04-12T12:00:00Z');
    const cells = gridCellsFromDays([{ date: '2026-04-12', count: 4, level: 4 }], sun);
    expect(cells[52]?.level).toBe(4);
    const filled = cells.filter(c => c.level !== 0);
    expect(filled).toHaveLength(1);
  });

  it('places yesterday one cell earlier than today in col-major order', () => {
    // Sat anchor at DOM 370 (row 6 col 52). Fri at row 5 col 52 → DOM 5*53+52=317.
    const cells = gridCellsFromDays(
      [
        { date: '2026-04-17', count: 1, level: 1 },
        { date: '2026-04-18', count: 3, level: 3 },
      ],
      SAT,
    );
    expect(cells[317]?.level).toBe(1);
    expect(cells[370]?.level).toBe(3);
  });

  it('wraps week boundaries: Saturday then the following Sunday differ by one calendar day but jump rows', () => {
    // 2026-04-12 Sun as "today" (dow=0, anchor at DOM 52).
    // 2026-04-11 Sat sits at (row 6, col 51) → DOM 6*53+51=369.
    const sun = new Date('2026-04-12T12:00:00Z');
    const cells = gridCellsFromDays(
      [
        { date: '2026-04-11', count: 1, level: 1 },
        { date: '2026-04-12', count: 2, level: 2 },
      ],
      sun,
    );
    expect(cells[52]?.level).toBe(2);
    expect(cells[369]?.level).toBe(1);
  });

  it('drops days that would fall outside the 53-week window', () => {
    const cells = gridCellsFromDays(
      [
        { date: '2025-03-14', count: 10, level: 4 }, // ~400 days before anchor
        { date: '2026-04-18', count: 1, level: 1 },
      ],
      SAT,
    );
    const filled = cells.filter(c => c.level !== 0);
    expect(filled).toHaveLength(1);
    expect(cells[370]?.level).toBe(1);
  });

  it('fills a realistic ~365-day window without crashing', () => {
    const days = Array.from({ length: 365 }, (_, i) => {
      const d = new Date(Date.UTC(2025, 3, 19) + i * 86400000);
      return {
        date: d.toISOString().slice(0, 10),
        count: i % 5,
        level: (i % 5) as 0 | 1 | 2 | 3 | 4,
      };
    });
    const cells = gridCellsFromDays(days, SAT);
    expect(cells).toHaveLength(371);
    // The 365th day maps to 2026-04-18 Saturday at DOM 370.
    expect(cells[370]?.level).toBeDefined();
  });

  // Regression: GitHub pads the final week with future-dated zero days.
  // Before the fix, `gridCellsFromDays` anchored on `days[last]` — the padded
  // future-Saturday — misplacing the entire grid on any non-Saturday view.
  it('ignores future-padded zeros and anchors on actual today (Wed-today view)', () => {
    const wed = new Date('2026-04-15T12:00:00Z');
    const cells = gridCellsFromDays(
      [
        { date: '2026-04-14', count: 1, level: 1 }, // Tue
        { date: '2026-04-15', count: 2, level: 2 }, // Wed (today)
        { date: '2026-04-16', count: 0, level: 0 }, // Thu (future padding)
        { date: '2026-04-17', count: 0, level: 0 }, // Fri (future padding)
        { date: '2026-04-18', count: 0, level: 0 }, // Sat (future padding)
      ],
      wed,
    );
    // Wed today → row 3, col 52 → DOM 211. Must be level 2, not 0.
    expect(cells[211]?.level).toBe(2);
    // Tue → row 2, col 52 → DOM 2*53+52 = 158.
    expect(cells[158]?.level).toBe(1);
    // No level placed at the padded-Saturday cell (DOM 370) — should stay 0.
    expect(cells[370]?.level).toBe(0);
  });
});
