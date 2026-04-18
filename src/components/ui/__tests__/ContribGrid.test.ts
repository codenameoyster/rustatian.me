import { describe, expect, it } from 'vitest';
import { gridCells, seededLevel } from '../ContribGrid';

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
