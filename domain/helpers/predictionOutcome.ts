export type MatchOutcome = 'HOME' | 'DRAW' | 'AWAY';

export function outcomeFromScores(home: number, away: number): MatchOutcome {
  if (home > away) return 'HOME';
  if (home < away) return 'AWAY';
  return 'DRAW';
}

// Largest-remainder rounding — guarantees homePct + drawPct + awayPct === 100.
export function toPercentages(breakdown: {
  homeCount: number;
  drawCount: number;
  awayCount: number;
}): { homePct: number; drawPct: number; awayPct: number } {
  const { homeCount, drawCount, awayCount } = breakdown;
  const total = homeCount + drawCount + awayCount;
  if (total === 0) return { homePct: 0, drawPct: 0, awayPct: 0 };

  const raws = [homeCount, drawCount, awayCount].map((c) => (c / total) * 100);
  const floors = raws.map(Math.floor);
  let leftover = 100 - floors.reduce((a, b) => a + b, 0);

  raws
    .map((r, i) => ({ i, remainder: r - floors[i] }))
    .sort((a, b) => b.remainder - a.remainder)
    .forEach(({ i }) => {
      if (leftover-- > 0) floors[i]++;
    });

  return { homePct: floors[0], drawPct: floors[1], awayPct: floors[2] };
}
