export type ScoringRules = {
  exactScorePoints: number;
  correctWinnerGoalDiffPoints: number;
  correctWinnerPoints: number;
  correctDrawPoints: number;
  knockoutMultiplier: number;
  finalMultiplier: number;
};

export const DEFAULT_SCORING_RULES: ScoringRules = {
  exactScorePoints: 3,
  correctWinnerGoalDiffPoints: 2,
  correctWinnerPoints: 1,
  correctDrawPoints: 1,
  knockoutMultiplier: 1.5,
  finalMultiplier: 2,
};

export function computeSwing(
  predHome: number,
  predAway: number,
  liveHome: number,
  liveAway: number,
  stage: string,
  rules: ScoringRules,
): number {
  const predWinner =
    predHome > predAway ? 'home' : predHome < predAway ? 'away' : 'draw';
  const liveWinner =
    liveHome > liveAway ? 'home' : liveHome < liveAway ? 'away' : 'draw';

  const mult =
    stage === 'FINAL' ? rules.finalMultiplier
    : stage === 'GROUP' ? 1
    : rules.knockoutMultiplier;

  if (predHome === liveHome && predAway === liveAway) {
    return Math.round(rules.exactScorePoints * mult * 10) / 10;
  }
  if (predWinner === liveWinner) {
    let base: number;
    if (liveWinner === 'draw') {
      base = rules.correctDrawPoints;
    } else if (predHome - predAway === liveHome - liveAway) {
      base = rules.correctWinnerGoalDiffPoints;
    } else {
      base = rules.correctWinnerPoints;
    }
    return Math.round(base * mult * 10) / 10;
  }
  return 0;
}
