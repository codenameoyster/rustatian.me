import type { ContribDay, Level } from '@/api/contributions';
import { trimPaddedDays } from '@/utils/trimPaddedDays';
import styles from './ContribGrid.module.css';

const WEEKS = 53;
const DAYS = 7;
const TOTAL_CELLS = WEEKS * DAYS;

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

// Map GitHub's flat day list onto the 53 × 7 grid. GitHub's contribution
// calendar returns whole Sun–Sat weeks, padding the final week with zero-count
// future days; `trimPaddedDays` drops those so the anchor is always today (not
// this week's upcoming Saturday). After trimming, today sits at the rightmost
// column at its day-of-week row, and earlier days walk backwards day-by-day.
//
// Internal math uses column-major indexing (week-then-day) so calendar-adjacent
// days are at adjacent indices; the final output is row-major to match the
// CSS grid's `grid-template-columns: repeat(53, 1fr)` flow.
export const gridCellsFromDays = (
  days: ReadonlyArray<ContribDay>,
  now: Date = new Date(),
): Cell[] => {
  const real = trimPaddedDays(days, now);
  if (real.length === 0) return emptyCells();

  const anchor = real[real.length - 1];
  if (!anchor) return emptyCells();

  const anchorMs = Date.parse(`${anchor.date}T00:00:00Z`);
  if (Number.isNaN(anchorMs)) return emptyCells();
  const anchorDow = new Date(anchorMs).getUTCDay();
  const anchorColMajor = (WEEKS - 1) * DAYS + anchorDow;

  const levels: Level[] = new Array<Level>(TOTAL_CELLS).fill(0);
  for (const day of real) {
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

// Placeholder numbers shown only in sample mode (pre-hydration, or when the
// component is used without props). Live mode reads exclusively from the
// `total` / `streak` props so we never mix fake values with a "// live" badge.
const SAMPLE_TOTAL = 1427;
const SAMPLE_STREAK = 21;

export const ContribGrid = ({ days, total, streak }: ContribGridProps) => {
  // `days !== undefined` (rather than `days.length > 0`) so a successful but
  // empty response stays in live mode instead of falling back to sample data.
  const isLive = days !== undefined;
  const cells = isLive ? gridCellsFromDays(days) : gridCells();
  const totalDisplay = total ?? (isLive ? 0 : SAMPLE_TOTAL);
  const streakDisplay = streak ?? (isLive ? 0 : SAMPLE_STREAK);
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
