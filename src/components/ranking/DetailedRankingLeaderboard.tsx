import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { rankingApi } from '../../api/ranking';
import { queryKeys } from '../../types/api';
import { RankingRow } from './RankingRow';

interface DetailedRankingLeaderboardProps {
  readonly groupId: string;
  readonly userId?: string;
}

export function DetailedRankingLeaderboard({
  groupId,
  userId,
}: DetailedRankingLeaderboardProps) {
  // Busca ranking do grupo (apenas pontos deste grupo)
  const { data: ranking, isLoading } = useQuery({
    queryKey: queryKeys.rankingGroup(groupId),
    queryFn: () => rankingApi.group(groupId),
    refetchInterval: 15_000,
    staleTime: 5_000,
    enabled: !!groupId,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={`loading-skeleton-${i}`} className="skeleton h-16 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!ranking?.length) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="text-4xl mb-3">📋</p>
        <p className="font-medium">Nenhum resultado ainda.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-2"
    >
      {ranking.map((entry, i) => (
        <RankingRow
          key={entry.userId}
          entry={entry}
          isMe={entry.userId === userId}
          index={i}
        />
      ))}
    </motion.div>
  );
}
