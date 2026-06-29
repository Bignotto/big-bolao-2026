export interface UserPredictionBreakdown {
  predictionId: number;
  matchId: number;
  predictedHomeScore: number;
  predictedAwayScore: number;
  predictedHasExtraTime: boolean;
  predictedHasPenalties: boolean;
  pointsEarned: number;
  exactScore: boolean;
  correctWinner: boolean;
  match: {
    id: number;
    matchDate: string;
    status: string;
    homeScore: number;
    awayScore: number;
    homeTeam: { name: string; flag: string };
    awayTeam: { name: string; flag: string };
  };
}
