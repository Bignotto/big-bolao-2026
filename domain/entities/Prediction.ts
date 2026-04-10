export type Prediction = {
  id: number;
  poolId: number;
  matchId: number;
  userId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedHasExtraTime: boolean;
  predictedHasPenalties: boolean;
  predictedPenaltyHomeScore: number | null;
  predictedPenaltyAwayScore: number | null;
  submittedAt: string;
  updatedAt: string | null;
  pointsEarned: number | null; // null until match is COMPLETED
};

export type PredictionPayload = {
  poolId: number;
  matchId: number;
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedHasExtraTime: boolean;
  predictedHasPenalties: boolean;
  predictedPenaltyHomeScore: number | null;
  predictedPenaltyAwayScore: number | null;
  predictionId?: number; // present when updating an existing prediction
};
