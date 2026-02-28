const SCORE_MIN = 48;
const SCORE_MAX = 60;

export function getScoreColor(score: number): string {
  const normalized = Math.max(0, Math.min(1, (score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)));

  if (normalized <= 0.5) {
    const t = normalized * 2;
    const r = Math.round(239 + (234 - 239) * t);
    const g = Math.round(68 + (179 - 68) * t);
    const b = Math.round(68 + (8 - 68) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }

  const t = (normalized - 0.5) * 2;
  const r = Math.round(234 + (34 - 234) * t);
  const g = Math.round(179 + (197 - 179) * t);
  const b = Math.round(8 + (94 - 8) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

export function getScoreColorForLegend(index: number, total: number): string {
  const score = SCORE_MIN + (index / (total - 1)) * (SCORE_MAX - SCORE_MIN);
  return getScoreColor(score);
}

export { SCORE_MIN, SCORE_MAX };
