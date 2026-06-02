import { useQuery } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { rankingApi } from '../../api/ranking';
import { queryKeys } from '../../types/api';
import { RankingRow } from '../../components/ranking/RankingRow';
import { useAuthStore } from '../../store/authStore';
import { UserAvatar } from '../../components/ui/UserAvatar';

export function RankingPage() {
  const userId = useAuthStore((s) => s.user?.id);

  const { data: ranking, isLoading, dataUpdatedAt, refetch, isFetching } = useQuery({
    queryKey: queryKeys.ranking,
    queryFn: rankingApi.list,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const { data: myRanking } = useQuery({
    queryKey: queryKeys.myRanking,
    queryFn: rankingApi.me,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const top3 = ranking?.slice(0, 3) ?? [];

  return (
    <div className="max-w-2xl mx-auto pb-24">
      {/* Hero podium section */}
      <div className="bg-linear-to-br from-slate-800 via-slate-900 to-slate-800 px-4 pt-6 pb-10 relative overflow-hidden">
        {/* Decorative rings */}
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

        {/* Title */}
        <div className="flex items-center justify-between mb-6 relative">
          <div>
            <h1 className="text-xl font-black text-white">🏆 Ranking</h1>
            <p className="text-xs text-slate-400 mt-0.5">Atualiza a cada 60 segundos</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => refetch()}
            disabled={isFetching}
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-slate-300 hover:bg-white/15 transition-colors"
          >
            <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
          </motion.button>
        </div>

        {/* Podium */}
        {top3.length === 3 && (
          <div className="flex items-end justify-center gap-3 relative">
            {/* 2nd */}
            <PodiumBlock entry={top3[1]} rank={2} height={80} delay={0.15} />
            {/* 1st */}
            <PodiumBlock entry={top3[0]} rank={1} height={110} delay={0} />
            {/* 3rd */}
            <PodiumBlock entry={top3[2]} rank={3} height={60} delay={0.25} />
          </div>
        )}

        {top3.length === 0 && !isLoading && (
          <p className="text-center text-slate-500 text-sm py-6">Nenhum dado ainda.</p>
        )}
        {isLoading && (
          <div className="flex justify-center items-end gap-3 h-28">
            {[80, 110, 60].map((h, i) => (
              <div key={i} className="skeleton rounded-t-xl w-20" style={{ height: h }} />
            ))}
          </div>
        )}
      </div>

      <div className="px-4 -mt-4 space-y-3">
        {/* My position card */}
        <AnimatePresence>
          {myRanking && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-600 text-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-lg shadow-green-200"
            >
              <div>
                <p className="text-xs text-green-100 font-medium">Sua posição</p>
                <p className="text-2xl font-black">#{myRanking.position}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black">{myRanking.totalPoints}</p>
                <p className="text-xs text-green-100">pontos</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full list */}
        {isLoading ? (
          <div className="space-y-2 mt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            {ranking?.map((entry, i) => (
              <RankingRow
                key={entry.userId}
                entry={entry}
                isMe={entry.userId === userId}
                index={i}
              />
            ))}
            {ranking?.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <p className="text-4xl mb-3">📋</p>
                <p className="font-medium">Nenhum resultado ainda.</p>
                <p className="text-sm mt-1">Os pontos aparecem após os jogos.</p>
              </div>
            )}
          </div>
        )}

        {dataUpdatedAt > 0 && (
          <p className="text-center text-[11px] text-slate-400 pb-2">
            Atualizado às{' '}
            {new Date(dataUpdatedAt).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  );
}

function PodiumBlock({
  entry,
  rank,
  height,
  delay,
}: {
  entry: { userName: string; totalPoints: number; userPhotoUrl?: string | null };
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
      className="flex flex-col items-center gap-2 flex-1 max-w-24"
    >
      {/* Avatar */}
      <div className="relative">
        <UserAvatar
          photoUrl={entry.userPhotoUrl}
          name={entry.userName}
          size="md"
          className="border-2 border-white/30"
        />
        <span className="absolute -bottom-1 -right-1 text-base">{medals[rank - 1]}</span>
      </div>

      <div className="text-center">
        <p className="text-xs text-white font-bold truncate max-w-20">
          {entry.userName.split(' ')[0]}
        </p>
        <p className="text-[11px] text-amber-300 font-bold">{entry.totalPoints} pts</p>
      </div>

      {/* Bar */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height }}
        transition={{ delay: delay + 0.1, duration: 0.5, ease: 'easeOut' as const }}
        className={`w-full rounded-t-xl ${colors[rank - 1]} flex items-start justify-center pt-2`}
        style={{ minHeight: height }}
      >
        <span className="text-white/60 text-xs font-bold">#{rank}</span>
      </motion.div>
    </motion.div>
  );
}
