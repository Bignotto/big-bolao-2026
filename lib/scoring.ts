export function computeSwing(
  predHome: number,
  predAway: number,
  liveHome: number,
  liveAway: number,
  stage: string,
): number {
  const predWinner =
    predHome > predAway ? 'home' : predHome < predAway ? 'away' : 'draw';
  const liveWinner =
    liveHome > liveAway ? 'home' : liveHome < liveAway ? 'away' : 'draw';

  let base = 0;
  if (predHome === liveHome && predAway === liveAway) {
    base = 5;
  } else if (predWinner === liveWinner && predHome - predAway === liveHome - liveAway) {
    base = 3;
  } else if (predWinner === liveWinner) {
    base = 2;
  }

  const mult =
    stage === 'FINAL' ? 2.0 : stage === 'GROUP' ? 1.0 : 1.5;

  return Math.round(base * mult * 10) / 10;
}
