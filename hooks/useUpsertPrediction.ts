import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/apiClient';
import { predictionKeys } from './predictionKeys';
import { matchKeys } from './matchKeys';
import type { Prediction, PredictionPayload } from '@/domain/entities/Prediction';

export function useUpsertPrediction(poolId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PredictionPayload) => {
      const {
        predictionId,
        predictedHomeScore,
        predictedAwayScore,
        predictedHasExtraTime,
        predictedHasPenalties,
        predictedPenaltyHomeScore,
        predictedPenaltyAwayScore,
      } = payload;

      const updateBody = {
        predictedHomeScore,
        predictedAwayScore,
        predictedHasExtraTime,
        predictedHasPenalties,
        ...(predictedPenaltyHomeScore !== null && { predictedPenaltyHomeScore }),
        ...(predictedPenaltyAwayScore !== null && { predictedPenaltyAwayScore }),
      };

      if (predictionId) {
        const data = await apiFetch<{ prediction: Prediction }>(
          `/predictions/${predictionId}`,
          { method: 'PUT', body: JSON.stringify(updateBody) }
        );
        return data.prediction ?? data;
      }

      const createBody = { poolId: payload.poolId, matchId: payload.matchId, ...updateBody };
      const data = await apiFetch<{ prediction: Prediction }>(
        '/predictions',
        { method: 'POST', body: JSON.stringify(createBody) }
      );
      return data.prediction ?? data;
    },

    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: predictionKeys.byPool(poolId) });

      const previousPredictions = queryClient.getQueryData<Prediction[]>(
        predictionKeys.byPool(poolId)
      );

      queryClient.setQueryData<Prediction[]>(
        predictionKeys.byPool(poolId),
        (old = []) => {
          const optimistic: Prediction = {
            id: payload.predictionId ?? -1,
            poolId,
            matchId: payload.matchId,
            userId: '',           // filled in server response
            predictedHomeScore: payload.predictedHomeScore,
            predictedAwayScore: payload.predictedAwayScore,
            predictedHasExtraTime: payload.predictedHasExtraTime,
            predictedHasPenalties: payload.predictedHasPenalties,
            predictedPenaltyHomeScore: payload.predictedPenaltyHomeScore,
            predictedPenaltyAwayScore: payload.predictedPenaltyAwayScore,
            submittedAt: new Date().toISOString(),
            updatedAt: null,
            pointsEarned: null,
          };
          const idx = old.findIndex(
            (p) => p.matchId === payload.matchId && p.poolId === poolId
          );
          if (idx >= 0) {
            const updated = [...old];
            updated[idx] = optimistic;
            return updated;
          }
          return [...old, optimistic];
        }
      );

      return { previousPredictions };
    },

    onError: (_err, _payload, context) => {
      if (context?.previousPredictions !== undefined) {
        queryClient.setQueryData(
          predictionKeys.byPool(poolId),
          context.previousPredictions
        );
      }
    },

    onSettled: (_data, _error, payload) => {
      queryClient.invalidateQueries({ queryKey: predictionKeys.byPool(poolId) });
      queryClient.invalidateQueries({ queryKey: matchKeys.predictionsMe(payload.matchId) });
    },
  });
}
