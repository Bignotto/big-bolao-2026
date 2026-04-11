export type MatchFilters = {
  stage?: string;
  group?: string;
  status?: string;
};

export const matchKeys = {
  all: ['matches'] as const,
  byTournament: (tournamentId: number, filters?: MatchFilters) =>
    [...matchKeys.all, 'tournament', tournamentId, filters ?? {}] as const,
  detail: (matchId: number) =>
    [...matchKeys.all, 'detail', matchId] as const,
  predictionsMe: (matchId: number) =>
    [...matchKeys.all, 'predictions-me', matchId] as const,
} as const;
