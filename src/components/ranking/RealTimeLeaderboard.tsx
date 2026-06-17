import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { rankingApi } from '../../api/ranking';
import { queryKeys } from '../../types/api';
import { RealTimeRankingRow } from './RealTimeRankingRow';
import { useRankingGroupHub } from '../../hooks/useRankingHub';
import { UserAvatar } from '../ui/UserAvatar';

interface RealTimeLeaderboardProps {
  groupId: string;
  userId?: string;
}

export function RealTimeLeaderboard({ groupId, userId }: RealTimeLeaderboardProps) {
  useRankingGroupHub(groupId);

  const { data: ranking, isLoading, isFetching, refetch } = useQuery({
    queryKey: queryKeys.realTimeRankingGroup(groupId),
    queryFn: () => rankingApi.realTime(groupId),
    refetchInterval: 15_000,
    staleTime: 5_000,
    enabled: !!groupId,
  });

  const top3 = ranking?.slice(0, 3) ?? [];
  const myEntry = ranking?.find((r) => r.userId === userId);

  return (
    <div className="space-y-4">
      {/* Top 3 Podium */}
      {top3.length >= 3 && (
        <div className="rounded-2xl bg-linear-to-br from-slate-800 via-slate-900 to-slate-800 p-6 overflow-hidden relative">
          {/* Decorative elements */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
            className="absolute -right-16 -top-16 w-48 h-48 border border-white/5 rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="absolute -left-12 -bottom-12 w-40 h-40 border border-white/5 rounded-full"
          />

          {/* Podium */}
          <div className="flex items-end justify-center gap-4 h-40 relative">
            {/* 2nd Place */}
            <PodiumPlace
              entry={top3[1]}
              rank={2}
              height={120}
              delay={0.15}
            />
            {/* 1st Place */}
            <PodiumPlace
              entry={top3[0]}
              rank={1}
              height={160}
              delay={0}
            />
            {/* 3rd Place */}
            <PodiumPlace
              entry={top3[2]}
              rank={3}
              height={80}
              delay={0.25}
            />
          </div>
        </div>
      )}

      {/* My Position Card */}
      <AnimatePresence>
        {myEntry && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-linear-to-r from-green-600 to-emerald-600 p-4 text-white shadow-lg shadow-green-200/50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-100 font-medium">Sua posição AGORA</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-3xl font-black">#{myEntry.momentaryPosition}</p>
                  <p className="text-2xl font-black">{myEntry.totalPoints + myEntry.momentaryPoints}</p>
                  <p className="text-xs text-green-100">pts</p>
                </div>
              </div>
              <div className="text-right">
                {myEntry.momentaryPoints > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="flex flex-col items-center"
                  >
                    <p className="text-4xl font-black text-green-200">+{myEntry.momentaryPoints}</p>
                    <p className="text-xs font-semibold text-green-100">em tempo real</p>
                  </motion.div>
                )}
                {myEntry.positionChange > 0 && (
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="text-3xl mt-2"
                  >
                    📈
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-slate-800 text-lg">🏆 Ranking em Tempo Real</h3>
          <p className="text-xs text-slate-500 mt-0.5">Atualiza enquanto os jogos estão acontecendo</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => refetch()}
          disabled={isFetching}
          className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
        >
          <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
        </motion.button>
      </div>

      {/* Ranking List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : ranking && ranking.length > 0 ? (
        <div className="space-y-2">
          {ranking.map((entry, i) => (
            <RealTimeRankingRow
              key={entry.userId}
              entry={entry}
              isMe={entry.userId === userId}
              index={i}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-slate-400">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-medium text-slate-500">Nenhum resultado ainda.</p>
          <p className="text-sm mt-1">Os pontos aparecem quando os jogos começam.</p>
        </div>
      )}

      {ranking && ranking.length > 0 && (
        <p className="text-center text-[11px] text-slate-400 pt-2">
          Atualizado às{' '}
          {ranking[0]?.updatedAt
            ? new Date(ranking[0].updatedAt).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
            : '—'}
        </p>
      )}
    </div>
  );
}

function PodiumPlace({
  entry,
  rank,
  height,
  delay,
}: {
  entry: any;
  rank: number;
  height: number;
  delay: number;
}) {
  const medals = ['🥇', '🥈', '🥉'];
  const colors = [
    'bg-linear-to-t from-amber-500 to-yellow-400',
    'bg-linear-to-t from-slate-500 to-slate-400',
    'bg-linear-to-t from-orange-600 to-amber-500',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 25 }}
      className="flex flex-col items-center gap-2 flex-1 max-w-28"
    >
      {/* Avatar */}
      <div className="relative">
        <UserAvatar
          photoUrl={entry.userPhotoUrl}
          name={entry.userName}
          size="md"
          className="border-2 border-white/30"
        />
        <span className="absolute -bottom-1 -right-1 text-lg">{medals[rank - 1]}</span>
      </div>

      <div className="text-center">
        <p className="text-xs text-white font-bold truncate max-w-24">
          {entry.userName.split(' ')[0]}
        </p>
        <motion.div
          key={entry.totalPoints + entry.momentaryPoints}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="text-xs text-amber-300 font-black"
        >
          {entry.totalPoints + entry.momentaryPoints} pts
        </motion.div>
        {entry.momentaryPoints > 0 && (
          <p className="text-[10px] text-green-300 font-semibold">+{entry.momentaryPoints}</p>
        )}
      </div>

      {/* Bar */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height }}
        transition={{ delay: delay + 0.1, duration: 0.5, ease: 'easeOut' as const }}
        className={`w-full rounded-t-lg ${colors[rank - 1]} flex items-start justify-center pt-2`}
        style={{ minHeight: height }}
      >
        <span className="text-white/70 text-xs font-bold">#{rank}</span>
      </motion.div>
    </motion.div>
  );
}
