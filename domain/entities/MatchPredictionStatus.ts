export type MatchPredictionStatus = {
  poolId: number;
  poolName: string;
  matchId: number;
  prediction: {
    id: number;
    predictedHomeScore: number;
    predictedAwayScore: number;
    predictedHasExtraTime: boolean;
    predictedHasPenalties: boolean;
    predictedPenaltyHomeScore: number | null;
    predictedPenaltyAwayScore: number | null;
    pointsEarned: number | null; // null until matchStatus === 'COMPLETED'
    submittedAt: string;
    updatedAt: string | null;
  } | null; // null = user has not submitted a prediction for this pool yet
};

// Extends MatchPredictionStatus with the user's rank in each pool's leaderboard
export type MyMatchPredictionEntry = MatchPredictionStatus & {
  userRank: number | null;
};
