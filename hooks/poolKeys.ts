export const poolKeys = {
  all: ['pools'] as const,
  myPools: ['pools', 'mine'] as const,
  detail: (id: number) => ['pools', id] as const,
  standings: (id: number) => ['pools', id, 'standings'] as const,
  search: (q: string) => ['pools', 'search', q] as const,
};
