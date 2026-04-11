import { Match, Team } from '@/domain/entities/Match';
import { MatchDTO, TeamDTO } from '@/data/dto/MatchDTO';
import { MatchStage } from '@/domain/enums/MatchStage';
import { MatchStatus } from '@/domain/enums/MatchStatus';

function mapTeam(dto: TeamDTO): Team {
  return {
    id: dto.id,
    name: dto.name,
    countryCode: dto.countryCode,
    flagUrl: dto.flagUrl,
  };
}

export function mapMatch(dto: MatchDTO): Match {
  return {
    id: dto.id,
    tournamentId: dto.tournamentId,
    homeTeam: mapTeam(dto.homeTeam),
    awayTeam: mapTeam(dto.awayTeam),
    matchDatetime: dto.matchDatetime,
    stage: dto.stage as MatchStage,
    group: dto.group,
    homeTeamScore: dto.homeTeamScore,
    awayTeamScore: dto.awayTeamScore,
    matchStatus: dto.matchStatus as MatchStatus,
    hasExtraTime: dto.hasExtraTime,
    hasPenalties: dto.hasPenalties,
    penaltyHomeScore: dto.penaltyHomeScore,
    penaltyAwayScore: dto.penaltyAwayScore,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
