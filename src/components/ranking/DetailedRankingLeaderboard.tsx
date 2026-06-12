import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, Trophy, Target, Zap } from 'lucide-react';
import { bolaoGroupsApi } from '../../api/bolaoGroups';
import { queryKeys } from '../../types/api';
import { UserAvatar } from '../ui/UserAvatar';

interface DetailedRankingLeaderboardProps {
  groupId: string;
}

const medals = ['🥇', '🥈', '🥉'];
const medalColors = [
  'from-amber-500 to-yellow-400',
  'from-slate-400 to-slate-300',
  'from-orange-500 to-orange-400',
];

export function DetailedRankingLeaderboard({ groupId }: DetailedRankingLeaderboardProps) {
  const { data: ranking, isLoading, error } = useQuery({
    queryKey: queryKeys.bolaoGroupRankingDetailed(groupId),
    queryFn: () => bolaoGroupsApi.rankingDetailed(groupId),
    refetchInterval: 15_000,
    staleTime: 5_000,
    enabled: !!groupId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p className="font-medium">Erro ao carregar ranking</p>
      </div>
    );
  }

  if (!ranking?.rankings.length) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p className="text-4xl mb-3">📋</p>
        <p className="font-medium">Nenhum resultado ainda.</p>
      </div>
    );
  }

  const leaderPoints = ranking.rankings[0]?.totalPoints || 0;
  const progressPercent = (ranking.processedMatches / ranking.totalMatches) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl p-4"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-blue-400" />
            <span className="text-sm font-medium text-slate-200">Progresso da Competição</span>
          </div>
          <span className="text-sm font-bold text-blue-300">
            {ranking.processedMatches}/{ranking.totalMatches} jogos
          </span>
        </div>
        <div className="w-full bg-slate-600 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="bg-gradient-to-r from-blue-500 to-blue-400 h-full"
          />
        </div>
        <p className="text-xs text-slate-400 mt-1">{progressPercent.toFixed(1)}% completo</p>
      </motion.div>

      {/* Leaderboard */}
      <div className="space-y-3">
        {ranking.rankings.map((entry, index) => (
          <motion.div
            key={entry.userId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`rounded-2xl overflow-hidden transition-all ${
              entry.isLeader
                ? 'ring-2 ring-amber-400 bg-gradient-to-r from-amber-50/10 to-yellow-50/10'
                : 'bg-white/5'
            }`}
          >
            <div className="p-4 flex items-center gap-4">
              {/* Rank */}
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/10 flex-shrink-0">
                {index < 3 ? (
                  <span className="text-2xl">{medals[index]}</span>
                ) : (
                  <span className="text-lg font-black text-slate-300">#{entry.position}</span>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <UserAvatar
                    photoUrl={entry.userPhotoUrl}
                    name={entry.userName}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white truncate">{entry.userName}</p>
                    <p className="text-xs text-slate-400">
                      {entry.totalPredictions} palpites
                    </p>
                  </div>
                  {entry.isLeader && (
                    <div className="bg-amber-500/20 border border-amber-400/30 rounded-lg px-2 py-1 flex-shrink-0">
                      <p className="text-xs font-bold text-amber-300">LÍDER</p>
                    </div>
                  )}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {/* Accuracy */}
                  <div className="bg-white/5 rounded-lg p-2">
                    <div className="flex items-center gap-1 text-slate-300 mb-1">
                      <Target size={12} />
                      <span className="font-medium">Acurácia</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex-1 bg-slate-600 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-400 h-full"
                          style={{ width: `${entry.accuracyRate}%` }}
                        />
                      </div>
                      <span className="font-bold text-green-400 min-w-fit">
                        {entry.accuracyRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Exact Scores */}
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-slate-400 mb-1 font-medium">Acertos Exatos</p>
                    <p className="text-lg font-bold text-blue-400">{entry.exactScores}</p>
                  </div>

                  {/* Avg Points */}
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-slate-400 mb-1 font-medium">Média/Palpite</p>
                    <p className="text-lg font-bold text-purple-400">
                      {entry.pointsPerPrediction.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Points Section */}
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <div className="text-center">
                  <p className="text-sm text-slate-400">Pontos</p>
                  <p className="text-3xl font-black text-white">{entry.totalPoints}</p>
                </div>
                {!entry.isLeader && (
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Diferença</p>
                    <p className="text-sm font-bold text-red-400">-{entry.pointsDifference}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-slate-400 pt-2">
        <p>
          Atualizado em{' '}
          {new Date(ranking.generatedAt).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
        <p>{ranking.groupName}</p>
      </div>
    </div>
  );
}
