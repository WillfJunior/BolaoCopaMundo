import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { matchesApi } from '../../api/matches';
import { MatchStatus, queryKeys } from '../../types/api';
import { MatchCard } from '../../components/match/MatchCard';

export function LivePage() {
  const { data: matches, isLoading } = useQuery({
    queryKey: queryKeys.upcoming(48),
    queryFn: () => matchesApi.upcoming(48),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  const liveMatches = matches?.filter((m) => m.status === MatchStatus.InProgress) ?? [];

  return (
    <div className="max-w-2xl mx-auto pb-24">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative px-4 py-8 bg-linear-to-br from-green-800 via-emerald-900 to-green-800 rounded-b-3xl overflow-hidden"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute -right-16 -top-16 w-48 h-48 border border-white/5 rounded-full"
        />

        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-300" />
            </span>
            <span className="text-xs font-bold text-green-200 uppercase tracking-wider">Ao Vivo</span>
          </div>
          <h1 className="text-3xl font-black text-white">⚽ Jogos ao Vivo</h1>
          <p className="text-green-100 mt-2 text-sm">
            Acompanhe os jogos que estão acontecendo agora
          </p>
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-4 mt-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-48 rounded-2xl" />
            ))}
          </div>
        ) : liveMatches.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {liveMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
              />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-3">⏰</p>
            <p className="font-medium">Nenhum jogo ao vivo no momento</p>
            <p className="text-sm mt-1">Volte quando houver jogos em andamento</p>
          </div>
        )}
      </div>
    </div>
  );
}
