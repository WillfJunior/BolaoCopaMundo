import { useQuery, useQueryClient } from '@tanstack/react-query';
import { rankingApi } from '../api/ranking';
import { bolaoGroupsApi } from '../api/bolaoGroups';
import { queryKeys } from '../types/api';

interface UseGroupRankingDetailedOptions {
  groupId: string;
  source?: 'ranking' | 'bolao-groups'; // qual endpoint usar
}

export function useGroupRankingDetailed({
  groupId,
  source = 'ranking',
}: UseGroupRankingDetailedOptions) {
  const useRankingEndpoint = source === 'ranking';

  return useQuery({
    queryKey: useRankingEndpoint
      ? queryKeys.rankingGroup(groupId)
      : queryKeys.bolaoGroupRankingDetailed(groupId),
    queryFn: () =>
      useRankingEndpoint
        ? rankingApi.group(groupId)
        : bolaoGroupsApi.rankingDetailed(groupId),
    refetchInterval: 15_000,
    staleTime: 5_000,
    enabled: !!groupId,
  });
}
