import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { poolKeys } from './poolKeys';
import type { MatchPredictionBreakdown } from '@/domain/entities/MatchPredictionBreakdown';

type OddsScope = {
  total: number;
  homeWinsPercentage: number;
  drawPercentage: number;
  awayWinsPercentage: number;
};

type MatchOddsPayload = {
  matchId: number;
  pool: OddsScope;
  global: OddsScope;
};

type MatchOddsResponse = { odds: MatchOddsPayload } | MatchOddsPayload;

export type BothBreakdowns = {
  pool: MatchPredictionBreakdown;
  global: MatchPredictionBreakdown;
};

function scopeToBreakdown(scope: OddsScope): MatchPredictionBreakdown {
  const { total, homeWinsPercentage, awayWinsPercentage } = scope;
  const homeCount = Math.round((homeWinsPercentage * total) / 100);
  const awayCount = Math.round((awayWinsPercentage * total) / 100);
  const drawCount = total - homeCount - awayCount;
  return { homeCount, drawCount, awayCount, total };
}

export function useMatchPredictionBreakdown(
  poolId: number | undefined,
  matchId: number | undefined,
) {
  return useQuery({
    queryKey: poolKeys.oddsBreakdown(poolId!, matchId!),
    queryFn: async (): Promise<BothBreakdowns> => {
      const raw = await apiFetch<MatchOddsResponse>(
        `/pools/${poolId}/matches/${matchId}/odds`,
      );
      const data = 'odds' in raw ? raw.odds : raw;
      return {
        pool: scopeToBreakdown(data.pool),
        global: scopeToBreakdown(data.global),
      };
    },
    enabled: poolId != null && matchId != null,
    staleTime: 30_000,
  });
}
