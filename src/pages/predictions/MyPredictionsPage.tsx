import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Target, ChevronRight, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { predictionsApi } from '../../api/predictions';
import { groupsApi } from '../../api/groups';
import { queryKeys, type PredictionDto, type MatchDto, MatchStatus } from '../../types/api';
import { ScoreBadge } from '../../components/match/ScoreBadge';
import { formatMatchDate, getImageUrl, computePoints } from '../../utils/formatters';
import { useGroupStore } from '../../store/groupStore';

type Filter = 'all' | 'exact' | 'partial' | 'miss' | 'pending';

const FILTERS: { key: Filter; label: string; emoji: string }[] = [
  { key: 'all',     label: 'Todos',     emoji: '📋' },
  { key: 'exact',   label: 'Acertos',   emoji: '✅' },
  { key: 'partial', label: 'Parcial',   emoji: '🟡' },
  { key: 'miss',    label: 'Erros',     emoji: '❌' },
  { key: 'pending', label: 'Pendentes', emoji: '⏳' },
];

/**
 * Resolve the effective points and processed state for a prediction.
 * Priority: backend (isProcessed=true) → client-side computation (match finished with score) → pending.
 */
function getEffective(p: PredictionDto, match: MatchDto | null) {
  if (p.isProcessed) {
    return { points: p.points, resolved: true };
  }
  if (
    match &&
    match.status === MatchStatus.Finished &&
    match.homeScore != null &&
    match.awayScore != null
  ) {
    const pts = computePoints(p.homeScore, p.awayScore, match.homeScore, match.awayScore);
    return { points: pts, resolved: true };
  }
  return { points: 0, resolved: false };
}

export function MyPredictionsPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const activeGroupId = useGroupStore((s) => s.activeGroupId);
  const groupName = useGroupStore((s) => s.activeGroupName);

  const { data: predictions, isLoading } = useQuery({
    queryKey: queryKeys.predictions(activeGroupId ?? ''),
    queryFn: () => predictionsApi.list(activeGroupId!),
    staleTime: 60_000,
    refetchInterval: 2 * 60_000,
    enabled: !!activeGroupId,
  });

  const { data: groups } = useQuery({
    queryKey: queryKeys.groups,
    queryFn: groupsApi.list,
    staleTime: 5 * 60_000,
  });

  // Build match lookup from groups data
  const matchMap = useMemo(() => {
    const map = new Map<number, MatchDto>();
    groups?.forEach((g) => g.matches.forEach((m) => map.set(m.id, m)));
    return map;
  }, [groups]);

  // Enrich predictions with effective points
  const enriched = useMemo(
    () =>
      (predictions ?? []).map((p) => ({
        prediction: p,
        match: matchMap.get(p.matchId) ?? null,
        ...getEffective(p, matchMap.get(p.matchId) ?? null),
      })),
    [predictions, matchMap]
  );

  const filtered = enriched.filter(({ points, resolved }) => {
    if (filter === 'exact')   return resolved && points === 3;
    if (filter === 'partial') return resolved && points === 1;
    if (filter === 'miss')    return resolved && points === 0;
    if (filter === 'pending') return !resolved;
    return true;
  });

  const total       = enriched.length;
  const totalPoints = enriched.reduce((s, e) => s + (e.resolved ? e.points : 0), 0);
  const exactCount  = enriched.filter((e) => e.resolved && e.points === 3).length;
  const partial     = enriched.filter((e) => e.resolved && e.points === 1).length;

  if (!activeGroupId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Users size={28} className="text-slate-400" />
        </div>
        <div>
          <p className="font-bold text-slate-700">Nenhum grupo selecionado</p>
          <p className="text-sm text-slate-400 mt-1">Acesse um grupo para ver seus palpites.</p>
        </div>
        <Link
          to="/meus-grupos"
          className="px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold shadow-md shadow-green-200 hover:bg-green-700 transition-colors"
        >
          Ir para Meus Grupos →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center shadow-md shadow-green-200">
          <Target size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-800">Meus Palpites</h1>
          <p className="text-xs text-slate-400">{groupName} · {total} palpites</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Pontos',     value: totalPoints, color: 'from-green-500 to-emerald-600', text: 'text-white' },
          { label: '✅ Exatos',   value: exactCount,  color: 'from-green-50 to-emerald-50',  text: 'text-green-700', border: 'border border-green-200' },
          { label: '🟡 Parciais', value: partial,     color: 'from-amber-50 to-yellow-50',   text: 'text-amber-700', border: 'border border-amber-200' },
        ].map(({ label, value, color, text, border }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`rounded-2xl bg-linear-to-br ${color} ${border ?? ''} p-3 text-center shadow-sm`}
          >
            <p className={`text-2xl font-black ${text}`}>{value}</p>
            <p className={`text-[11px] ${text} opacity-80 mt-0.5`}>{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
        {FILTERS.map(({ key, label, emoji }) => {
          const count =
            key === 'all'
              ? total
              : key === 'exact'
                ? exactCount
                : key === 'partial'
                  ? partial
                  : key === 'miss'
                    ? enriched.filter((e) => e.resolved && e.points === 0).length
                    : enriched.filter((e) => !e.resolved).length;

          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.94 }}
              onClick={() => setFilter(key)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                filter === key
                  ? 'bg-green-600 text-white shadow-md shadow-green-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-green-300'
              }`}
            >
              <span>{emoji}</span>
              {label}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  filter === key ? 'bg-white/20' : 'bg-slate-100'
                }`}>
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-14 text-slate-400"
            >
              <Target size={48} className="mx-auto mb-3 opacity-20" />
              <p className="font-semibold text-slate-500">Nenhum palpite aqui</p>
              <p className="text-sm mt-1">Tente outro filtro.</p>
            </motion.div>
          ) : (
            <motion.div
              key={filter}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-2.5"
            >
              {filtered.map((e, i) => (
                <PredictionItem
                  key={e.prediction.id}
                  prediction={e.prediction}
                  match={e.match}
                  points={e.points}
                  resolved={e.resolved}
                  index={i}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

interface ItemProps {
  prediction: PredictionDto;
  match: MatchDto | null;
  points: number;
  resolved: boolean;
  index: number;
}

function PredictionItem({ prediction: p, match, points, resolved, index }: ItemProps) {
  const isFinished = match?.status === MatchStatus.Finished;
  const isLive     = match?.status === MatchStatus.InProgress;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link
        to={`/matches/${p.matchId}`}
        className="block bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4 hover:border-green-200 hover:shadow-md transition-all group"
      >
        {/* Teams + scores row */}
        <div className="flex items-center gap-2">
          {/* Home team */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            {getImageUrl(match?.homeTeam?.flagUrl) ? (
              <img
                src={getImageUrl(match?.homeTeam?.flagUrl)!}
                alt={match?.homeTeam?.name}
                className="w-7 h-5 object-cover rounded-sm shadow-sm shrink-0"
              />
            ) : (
              <div className="w-7 h-5 rounded-sm bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-400 shrink-0">
                {match?.homeTeam?.fifaCode ?? '?'}
              </div>
            )}
            <span className="text-sm font-semibold text-slate-700 truncate">
              {match?.homeTeam?.name ?? 'Time A'}
            </span>
          </div>

          {/* Score column */}
          <div className="flex flex-col items-center gap-1 shrink-0 px-2">
            {/* Official result */}
            {(isFinished || isLive) && match?.homeScore != null ? (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-bold tabular-nums ${
                isLive
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                <span>{match.homeScore}</span>
                <span className="text-slate-400 font-light">—</span>
                <span>{match.awayScore}</span>
              </div>
            ) : (
              <span className="text-xs text-slate-300 font-medium">vs</span>
            )}
            {/* User prediction */}
            <div className="flex items-center gap-1 text-xs">
              <span className="font-bold text-green-700">{p.homeScore}</span>
              <span className="text-slate-300">—</span>
              <span className="font-bold text-green-700">{p.awayScore}</span>
              <span className="text-slate-400 text-[10px] ml-0.5">seu</span>
            </div>
          </div>

          {/* Away team */}
          <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
            <span className="text-sm font-semibold text-slate-700 truncate text-right">
              {match?.awayTeam?.name ?? 'Time B'}
            </span>
            {getImageUrl(match?.awayTeam?.flagUrl) ? (
              <img
                src={getImageUrl(match?.awayTeam?.flagUrl)!}
                alt={match?.awayTeam?.name}
                className="w-7 h-5 object-cover rounded-sm shadow-sm shrink-0"
              />
            ) : (
              <div className="w-7 h-5 rounded-sm bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-400 shrink-0">
                {match?.awayTeam?.fifaCode ?? '?'}
              </div>
            )}
          </div>

          <ChevronRight size={14} className="text-slate-300 group-hover:text-green-500 transition-colors shrink-0 ml-1" />
        </div>

        {/* Bottom: date + badge */}
        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-50">
          <span className="text-[11px] text-slate-400">
            {match ? formatMatchDate(match.matchDate) : formatMatchDate(p.updatedAt)}
          </span>

          {resolved ? (
            /* Always show badge when resolved (backend OR client-side) */
            <ScoreBadge points={points} isProcessed />
          ) : isLive ? (
            <span className="text-[11px] text-green-600 font-semibold animate-pulse">
              ⚽ Em andamento...
            </span>
          ) : (
            <span className="text-[11px] text-amber-500 font-medium">
              ⏳ Aguardando...
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
