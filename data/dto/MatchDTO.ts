export interface TeamDTO {
  id: number;
  name: string;
  countryCode: string | null;
  flagUrl: string | null;
}

export interface MatchDTO {
  id: number;
  tournamentId: number;
  homeTeam: TeamDTO;
  awayTeam: TeamDTO;
  matchDatetime: string;
  stage: string;
  group: string | null;
  homeTeamScore: number | null;
  awayTeamScore: number | null;
  matchStatus: string;
  hasExtraTime: boolean;
  hasPenalties: boolean;
  penaltyHomeScore: number | null;
  penaltyAwayScore: number | null;
  createdAt: string;
  updatedAt: string | null;
}
