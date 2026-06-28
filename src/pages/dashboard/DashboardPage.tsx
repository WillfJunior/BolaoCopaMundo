import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Trophy, Swords } from 'lucide-react';
import { groupsApi } from '../../api/groups';
import { queryKeys } from '../../types/api';
import { useAuthStore } from '../../store/authStore';
import { GroupStandingsSection } from '../../components/standings/GroupStandingsSection';
import { KnockoutBracket } from '../../components/standings/KnockoutBracket';
import { RealTimeLeaderboard } from '../../components/ranking/RealTimeLeaderboard';
import { useGroupStore } from '../../store/groupStore';

type Tab = 'copa' | 'mata-mata' | 'bolao';

export function DashboardPage() {
  const [tab, setTab] = useState<Tab>('copa');
  const userId = useAuthStore((s) => s.user?.id);
  const groupId = useGroupStore((s) => s.activeGroupId);

  const { data: allStandings, isLoading: loadingStandings } = useQuery({
    queryKey: queryKeys.standingsAll,
    queryFn: groupsApi.standingsAll,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative px-4 py-8 bg-linear-to-br from-slate-800 via-slate-900 to-slate-800 rounded-b-3xl overflow-hidden"
      >
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
        <div className="relative">
          <h1 className="text-3xl font-black text-white">🎯 Copa do Mundo 2026</h1>
          <p className="text-slate-300 mt-2 text-sm">
            Acompanhe a classificação e seu desempenho no bolão
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="px-4 mt-6 flex rounded-xl bg-slate-100 p-1 gap-0.5">
        {/* Classificação */}
        <motion.button
          onClick={() => setTab('copa')}
          className="flex-1 relative py-2 px-3 rounded-lg transition-all font-semibold"
        >
          {tab === 'copa' && (
            <motion.div
              layoutId="dashboard-tab"
              className="absolute inset-0 bg-white rounded-lg shadow-sm"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span className={`relative z-10 flex items-center justify-center gap-1.5 text-sm ${
            tab === 'copa' ? 'text-amber-700' : 'text-slate-500'
          }`}>
            <Trophy size={15} />
            Classificação
          </span>
        </motion.button>

        {/* Mata-mata */}
        <motion.button
          onClick={() => setTab('mata-mata')}
          className="flex-1 relative py-2 px-3 rounded-lg transition-all font-semibold"
        >
          {tab === 'mata-mata' && (
            <motion.div
              layoutId="dashboard-tab"
              className="absolute inset-0 bg-white rounded-lg shadow-sm"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span className={`relative z-10 flex items-center justify-center gap-1.5 text-sm ${
            tab === 'mata-mata' ? 'text-red-700' : 'text-slate-500'
          }`}>
            <Swords size={15} />
            Mata-mata
          </span>
        </motion.button>

        {/* Meu Bolão */}
        {groupId && (
          <motion.button
            onClick={() => setTab('bolao')}
            className="flex-1 relative py-2 px-3 rounded-lg transition-all font-semibold"
          >
            {tab === 'bolao' && (
              <motion.div
                layoutId="dashboard-tab"
                className="absolute inset-0 bg-white rounded-lg shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className={`relative z-10 flex items-center justify-center gap-1.5 text-sm ${
              tab === 'bolao' ? 'text-green-700' : 'text-slate-500'
            }`}>
              <TrendingUp size={15} />
              Meu Bolão
            </span>
          </motion.button>
        )}
      </div>

      {/* Content */}
      <div className="px-4 mt-6">
        <AnimatePresence mode="wait">
          {/* Copa Tab */}
          {tab === 'copa' && (
            <motion.div
              key="copa"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {loadingStandings ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton h-80 rounded-2xl" />
                ))
              ) : allStandings ? (
                allStandings.map((standing, i) => (
                  <GroupStandingsSection
                    key={standing.groupName}
                    groupName={standing.groupName}
                    groupNumber={i}
                  />
                ))
              ) : (
                <div className="text-center py-16 text-slate-400">
                  <p className="text-4xl mb-3">🔍</p>
                  <p className="font-medium">Nenhum dado disponível</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Mata-mata Tab */}
          {tab === 'mata-mata' && (
            <motion.div
              key="mata-mata"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <KnockoutBracket />
            </motion.div>
          )}

          {/* Bolão Tab */}
          {tab === 'bolao' && groupId && (
            <motion.div
              key="bolao"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <RealTimeLeaderboard groupId={groupId} userId={userId} />
            </motion.div>
          )}

          {/* No group message */}
          {tab === 'bolao' && !groupId && (
            <motion.div
              key="no-group"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-slate-400"
            >
              <p className="text-4xl mb-3">👥</p>
              <p className="font-medium">Nenhum bolão ativo</p>
              <p className="text-sm mt-1">Crie ou entre em um bolão para começar</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
