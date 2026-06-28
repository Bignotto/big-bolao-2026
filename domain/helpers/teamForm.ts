import type { Match } from '@/domain/entities/Match';
import { MatchStatus } from '@/domain/enums/MatchStatus';

export type FormResult = 'W' | 'D' | 'L';

// Returns the result of a finished match from teamId's perspective.
// Returns null if the match isn't completed, scores are missing, or teamId didn't play.
export function resultForTeam(match: Match, teamId: number): FormResult | null {
  if (
    match.matchStatus !== MatchStatus.COMPLETED ||
    match.homeTeamScore == null ||
    match.awayTeamScore == null
  ) {
    return null;
  }

  const isHome = match.homeTeam.id === teamId;
  const isAway = match.awayTeam.id === teamId;
  if (!isHome && !isAway) return null;

  const myScore = isHome ? match.homeTeamScore : match.awayTeamScore;
  const oppScore = isHome ? match.awayTeamScore : match.homeTeamScore;

  if (myScore > oppScore) return 'W';
  if (myScore < oppScore) return 'L';
  return 'D';
}
