export enum MatchStage {
  GROUP = 'GROUP',
  ROUND_OF_32 = 'ROUND_OF_32',
  ROUND_OF_16 = 'ROUND_OF_16',
  QUARTER_FINAL = 'QUARTER_FINAL',
  SEMI_FINAL = 'SEMI_FINAL',
  FINAL = 'FINAL',
  THIRD_PLACE = 'THIRD_PLACE',
  LOSERS_MATCH = 'LOSERS_MATCH',
}

export const STAGE_LABELS: Record<MatchStage, string> = {
  [MatchStage.GROUP]: 'Fase de Grupos',
  [MatchStage.ROUND_OF_32]: 'Dezasseis',
  [MatchStage.ROUND_OF_16]: 'Oitavas',
  [MatchStage.QUARTER_FINAL]: 'Quartas',
  [MatchStage.SEMI_FINAL]: 'Semifinal',
  [MatchStage.FINAL]: 'Final',
  [MatchStage.THIRD_PLACE]: '3º lugar',
  [MatchStage.LOSERS_MATCH]: 'Repescagem',
};
