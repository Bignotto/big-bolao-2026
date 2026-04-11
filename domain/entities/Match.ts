import { MatchStage } from '../enums/MatchStage';
import { MatchStatus } from '../enums/MatchStatus';

export type { MatchStage, MatchStatus };

export interface Team {
  id: number;
  name: string;
  countryCode: string | null; // e.g. "BRA" — ISO 3-char code
  flagUrl: string | null;
}

export interface Match {
  id: number;
  tournamentId: number;
  homeTeam: Team;
  awayTeam: Team;
  matchDatetime: string; // ISO 8601
  stage: MatchStage;
  group: string | null;
  stadium: string | null;
  homeTeamScore: number | null;
  awayTeamScore: number | null;
  matchStatus: MatchStatus;
  hasExtraTime: boolean;
  hasPenalties: boolean;
  penaltyHomeScore: number | null;
  penaltyAwayScore: number | null;
  createdAt: string;
  updatedAt: string | null;
}

// Helper — true when the match has already kicked off (use to lock predictions)
export function isMatchLocked(match: Pick<Match, 'matchDatetime'>): boolean {
  return new Date(match.matchDatetime) <= new Date();
}
