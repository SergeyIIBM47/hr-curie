export interface DonutSlice {
  dasharray: string;
  dashoffset: number;
  percent: number;
}

const TOTAL = 100;
const START_OFFSET = 25;

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function computeSlices(counts: number[]): DonutSlice[] {
  const total = counts.reduce((sum, n) => sum + Math.max(0, n), 0);

  if (total === 0) {
    return counts.map(() => ({
      dasharray: `0 ${TOTAL}`,
      dashoffset: START_OFFSET,
      percent: 0,
    }));
  }

  let cumulative = 0;
  return counts.map((count) => {
    const safeCount = Math.max(0, count);
    const percent = round((safeCount / total) * TOTAL);
    const dashoffset = round((TOTAL + START_OFFSET - cumulative) % TOTAL);
    cumulative += percent;
    return {
      dasharray: `${percent} ${round(TOTAL - percent)}`,
      dashoffset,
      percent,
    };
  });
}
