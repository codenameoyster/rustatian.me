import styles from './ContribGrid.module.css';

const WEEKS = 53;
const DAYS = 7;

const seededLevel = (i: number): 0 | 1 | 2 | 3 | 4 => {
  const h = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  const r = h - Math.floor(h);
  if (r < 0.42) return 0;
  if (r < 0.62) return 1;
  if (r < 0.8) return 2;
  if (r < 0.93) return 3;
  return 4;
};

const gridCells = () => {
  const out: Array<{ key: number; level: number }> = [];
  for (let d = 0; d < DAYS; d++) {
    for (let w = 0; w < WEEKS; w++) {
      const i = w * DAYS + d;
      out.push({ key: i, level: seededLevel(i + 11) });
    }
  }
  return out;
};

interface ContribGridProps {
  total?: number | undefined;
  streak?: number | undefined;
}

export const ContribGrid = ({ total = 1427, streak = 21 }: ContribGridProps) => {
  const cells = gridCells();
  return (
    <div className={styles.contrib}>
      <div className={styles.head}>
        <span>
          <b>{total.toLocaleString()}</b> contributions · last 12 months
        </span>
        <span>
          <b>{streak}</b> day streak
        </span>
      </div>
      <div className={styles.grid} aria-hidden="true">
        {cells.map(c => (
          <div key={c.key} className={styles.cell} data-level={c.level} />
        ))}
      </div>
      <div className={styles.legend}>
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
