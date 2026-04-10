export const predictionKeys = {
  all: ['predictions'] as const,
  byPool: (poolId: number) =>
    [...predictionKeys.all, 'pool', poolId] as const,
  byMatch: (matchId: number) =>
    [...predictionKeys.all, 'match', matchId] as const,
  detail: (predictionId: number) =>
    [...predictionKeys.all, 'detail', predictionId] as const,
} as const;
