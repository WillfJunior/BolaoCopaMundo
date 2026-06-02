import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { groupsApi } from '../../api/groups';
import { predictionsApi } from '../../api/predictions';
import { queryKeys, type MatchDto } from '../../types/api';
import { MatchCard } from '../../components/match/MatchCard';
import { getImageUrl } from '../../utils/formatters';

type Tab = 'matches' | 'standings';

export function GroupDetailPage() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('matches');

  const { data: group, isLoading } = useQuery({
    queryKey: queryKeys.group(name!),
    queryFn: () => groupsApi.get(name!),
    staleTime: 5 * 60_000,
    enabled: !!name,
  });

  const { data: predictions } = useQuery({
    queryKey: queryKeys.predictions,
    queryFn: predictionsApi.list,
    staleTime: 5 * 60_000,
  });

  const matchesByRound = group?.matches.reduce<Record<number, MatchDto[]>>((acc, m) => {
    const round = m.matchday ?? 1;
    if (!acc[round]) acc[round] = [];
    acc[round].push(m);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <div className="skeleton h-8 w-32 rounded-xl" />
        <div className="skeleton h-24 rounded-2xl" />
        <div className="skeleton h-40 rounded-2xl" />
        <div className="skeleton h-40 rounded-2xl" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-slate-400">
        <p className="text-4xl mb-3">🔍</p>
        <p>Grupo não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 space-y-4">
      {/* Back + Title */}
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={18} className="text-slate-600" />
        </motion.button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Grupo {group.name}</h1>
          <p className="text-xs text-slate-400">{group.matches.length} jogos</p>
        </div>
      </div>

      {/* Teams cards */}
      <div className="grid grid-cols-4 gap-2">
        {group.teams.map((team, i) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex flex-col items-center gap-1.5 p-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm"
          >
            {getImageUrl(team.flagUrl) ? (
              <img
                src={getImageUrl(team.flagUrl)!}
                alt={team.name}
                className="w-10 h-7 object-cover rounded-md shadow-sm"
              />
            ) : (
              <div className="w-10 h-7 rounded-md bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">
                {team.fifaCode}
              </div>
            )}
            <span className="text-[10px] text-center text-slate-600 leading-tight font-medium line-clamp-2">
              {team.name}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
        {(['matches', 'standings'] as Tab[]).map((t) => (
          <motion.button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 relative py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            {tab === t && (
              <motion.div
                layoutId="group-tab"
                className="absolute inset-0 bg-white rounded-lg shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className={`relative z-10 transition-colors ${tab === t ? 'text-green-700' : 'text-slate-500'}`}>
              {t === 'matches' ? '⚽ Jogos' : '📊 Classificação'}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {tab === 'matches' ? (
          <motion.div
            key="matches"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {Object.entries(matchesByRound ?? {})
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([round, matches]) => (
                <div key={round}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Rodada {round}
                    </span>
                    <div className="flex-1 h-px bg-slate-100" />
                  </div>
                  <div className="space-y-3">
                    {matches.map((m) => (
                      <MatchCard
                        key={m.id}
                        match={m}
                        prediction={predictions?.find((p) => p.matchId === m.id) ?? null}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </motion.div>
        ) : (
          <motion.div
            key="standings"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
          >
            {/* Header */}
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>#</span>
              <span>Seleção</span>
              <span className="text-center">J</span>
              <span className="text-center">SG</span>
              <span className="text-center">Pts</span>
            </div>
            {group.teams.map((team, i) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 px-4 py-3 items-center text-sm border-b border-slate-50 last:border-0 ${i < 2 ? 'bg-green-50/50' : ''}`}
              >
                <div className="w-6 text-center">
                  {i < 2 ? (
                    <span className="text-green-600 font-bold">{i + 1}</span>
                  ) : (
                    <span className="text-slate-400">{i + 1}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  {getImageUrl(team.flagUrl) ? (
                    <img src={getImageUrl(team.flagUrl)!} alt={team.name} className="w-7 h-5 object-cover rounded-sm shrink-0" />
                  ) : (
                    <span className="text-xs font-bold text-slate-400 w-7 shrink-0">{team.fifaCode}</span>
                  )}
                  <span className="font-semibold text-slate-700 truncate">{team.name}</span>
                </div>
                <span className="text-center text-slate-500">0</span>
                <span className="text-center text-slate-500">0</span>
                <span className="text-center font-bold text-slate-800">0</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
