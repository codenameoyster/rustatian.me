import { describe, expect, it } from 'vitest';
import { gridCells, gridCellsFromDays, seededLevel } from '../ContribGrid';

describe('ContribGrid seeded generator', () => {
  it('seededLevel is pure — same input returns same output across calls', () => {
    for (let i = 0; i < 100; i += 1) {
      expect(seededLevel(i)).toBe(seededLevel(i));
    }
  });

  it('gridCells returns identical output on repeated calls (SSR / hydrate parity)', () => {
    expect(gridCells()).toEqual(gridCells());
  });

  it('gridCells fills a 53 × 7 week grid (371 cells)', () => {
    expect(gridCells()).toHaveLength(371);
  });

  it('every cell level is in the valid 0..4 range', () => {
    for (const cell of gridCells()) {
      expect(cell.level).toBeGreaterThanOrEqual(0);
      expect(cell.level).toBeLessThanOrEqual(4);
    }
  });
});

describe('gridCellsFromDays', () => {
  it('returns 371 empty cells for an empty days array', () => {
    const cells = gridCellsFromDays([]);
    expect(cells).toHaveLength(371);
    expect(cells.every(c => c.level === 0)).toBe(true);
  });

  it('places the anchor (last) day in the last column at its day-of-week row', () => {
    // 2026-04-18 is a Saturday (UTC dayOfWeek = 6).
    // Grid row=6, col=52 → DOM index = 6 * 53 + 52 = 370.
    const cells = gridCellsFromDays([{ date: '2026-04-18', count: 5, level: 4 }]);
    expect(cells[370]?.level).toBe(4);
    // Every other cell is empty.
    const filled = cells.filter(c => c.level !== 0);
    expect(filled).toHaveLength(1);
  });

  it('places a Wednesday anchor at row 3, col 52', () => {
    // 2026-04-15 is a Wednesday (UTC dayOfWeek = 3).
    // DOM index = 3 * 53 + 52 = 211.
    const cells = gridCellsFromDays([{ date: '2026-04-15', count: 2, level: 2 }]);
    expect(cells[211]?.level).toBe(2);
  });

  it('places yesterday one cell earlier than today in col-major order', () => {
    // 2026-04-18 Sat anchor at DOM 370 (row 6 col 52).
    // 2026-04-17 Fri at row 5 col 52 → DOM 5 * 53 + 52 = 317.
    const cells = gridCellsFromDays([
      { date: '2026-04-17', count: 1, level: 1 },
      { date: '2026-04-18', count: 3, level: 3 },
    ]);
    expect(cells[317]?.level).toBe(1);
    expect(cells[370]?.level).toBe(3);
  });

  it('wraps week boundaries: Saturday then the following Sunday differ by one calendar day but jump rows', () => {
    // 2026-04-11 Sat → (row 6, col W).
    // 2026-04-12 Sun → (row 0, col W+1).
    // With 2026-04-12 as anchor (row 0, col 52 → DOM 0*53+52=52),
    // 2026-04-11 sits at (row 6, col 51) → DOM 6*53+51=369.
    const cells = gridCellsFromDays([
      { date: '2026-04-11', count: 1, level: 1 },
      { date: '2026-04-12', count: 2, level: 2 },
    ]);
    expect(cells[52]?.level).toBe(2);
    expect(cells[369]?.level).toBe(1);
  });

  it('drops days that would fall outside the 53-week window', () => {
    // Anchor 2026-04-18 Sat. Something 400 days ago is well before the grid start.
    const cells = gridCellsFromDays([
      { date: '2025-03-14', count: 10, level: 4 }, // ~400 days before anchor
      { date: '2026-04-18', count: 1, level: 1 },
    ]);
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
    const cells = gridCellsFromDays(days);
    expect(cells).toHaveLength(371);
  });
});
