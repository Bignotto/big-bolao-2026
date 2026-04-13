export type PoolMatchPrediction = {
  id: number;
  userId?: string;
  user_id?: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedHasExtraTime?: boolean;
  predictedHasPenalties?: boolean;
  predictedPenaltyHomeScore?: number | null;
  predictedPenaltyAwayScore?: number | null;
  pointsEarned: number | null;
  submittedAt: string;
  updatedAt: string | null;
};

export type PoolMatchPredictionEntry = {
  userId: string;
  rank: number | null;
  user: {
    id: string;
    fullName: string;
    profileImageUrl: string | null;
  };
  prediction: PoolMatchPrediction | null;
};
