import type { ContribDay } from '@/api/contributions';
import styles from './ContribGrid.module.css';

const WEEKS = 53;
const DAYS = 7;
const TOTAL_CELLS = WEEKS * DAYS;

type Level = 0 | 1 | 2 | 3 | 4;
type Cell = { key: number; level: Level };

// Deterministic pseudo-random (sin-based hash, weighted bins). The grid is
// decorative — not real GitHub data — but SSR prerender and client hydration
// must produce byte-identical output to avoid hydration-mismatch warnings.
// `Math.sin` seeded on the integer index is the cheapest stable generator.
// Exported for direct determinism testing.
export const seededLevel = (i: number): Level => {
  const h = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  const r = h - Math.floor(h);
  if (r < 0.42) return 0;
  if (r < 0.62) return 1;
  if (r < 0.8) return 2;
  if (r < 0.93) return 3;
  return 4;
};

export const gridCells = (): Cell[] => {
  const out: Cell[] = [];
  for (let d = 0; d < DAYS; d++) {
    for (let w = 0; w < WEEKS; w++) {
      const i = w * DAYS + d;
      out.push({ key: i, level: seededLevel(i + 11) });
    }
  }
  return out;
};

const emptyCells = (): Cell[] =>
  Array.from({ length: TOTAL_CELLS }, (_, key) => ({ key, level: 0 as Level }));

// Map GitHub's flat day list (chronological, last = today) onto the
// 53 × 7 grid, anchoring today at the rightmost column in its day-of-week
// row and walking backwards day-by-day. Dates outside the 371-cell window
// are silently dropped.
export const gridCellsFromDays = (days: ReadonlyArray<ContribDay>): Cell[] => {
  if (days.length === 0) return emptyCells();

  const anchor = days[days.length - 1];
  if (!anchor) return emptyCells();

  const anchorMs = Date.parse(`${anchor.date}T00:00:00Z`);
  if (Number.isNaN(anchorMs)) return emptyCells();
  const anchorDow = new Date(anchorMs).getUTCDay();

  // Anchor sits in the last column (WEEKS - 1) at row = anchorDow.
  // Col-major index (week-then-day) for anchor:
  const anchorColMajor = (WEEKS - 1) * DAYS + anchorDow;

  const levels: Level[] = new Array<Level>(TOTAL_CELLS).fill(0);
  for (const day of days) {
    const dayMs = Date.parse(`${day.date}T00:00:00Z`);
    if (Number.isNaN(dayMs)) continue;
    const daysAgo = Math.round((anchorMs - dayMs) / 86_400_000);
    const colMajor = anchorColMajor - daysAgo;
    if (colMajor < 0 || colMajor >= TOTAL_CELLS) continue;
    const d = colMajor % DAYS;
    const w = Math.floor(colMajor / DAYS);
    const domIdx = d * WEEKS + w;
    levels[domIdx] = day.level;
  }

  return levels.map((level, key) => ({ key, level }));
};

interface ContribGridProps {
  days?: ReadonlyArray<ContribDay> | undefined;
  total?: number | undefined;
  streak?: number | undefined;
}

export const ContribGrid = ({ days, total, streak }: ContribGridProps) => {
  const isLive = days !== undefined && days.length > 0;
  const cells = isLive ? gridCellsFromDays(days) : gridCells();
  const totalDisplay = total ?? 1427;
  const streakDisplay = streak ?? 21;
  const legendNote = isLive ? '// live' : '// sample data';

  return (
    <div className={styles.contrib}>
      <div className={styles.head}>
        <span>
          <b>{totalDisplay.toLocaleString()}</b> contributions · last 12 months
        </span>
        <span>
          <b>{streakDisplay}</b> day streak
        </span>
      </div>
      <div className={styles.grid} aria-hidden="true">
        {cells.map(c => (
          <div key={c.key} className={styles.cell} data-level={c.level} />
        ))}
      </div>
      <div className={styles.legend}>
        <span className="muted">{legendNote}</span>
        <span className={styles.scale}>
          less
          <span data-level="0" />
          <span data-level="1" />
          <span data-level="2" />
          <span data-level="3" />
          <span data-level="4" />
          more
        </span>
      </div>
    </div>
  );
};
