export const teamKeys = {
  all: ['teams'] as const,
  recentForm: (teamId: number, limit: number) =>
    [...teamKeys.all, teamId, 'recent-form', limit] as const,
};
