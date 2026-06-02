import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { groupsApi } from '../../api/groups';
import { matchesApi } from '../../api/matches';
import { predictionsApi } from '../../api/predictions';
import { queryKeys, MatchStatus, type GroupDto } from '../../types/api';
import { MatchCard } from '../../components/match/MatchCard';
import { formatMatchDate, getImageUrl } from '../../utils/formatters';
import { useCountdown } from '../../hooks/useCountdown';
import { useAuthStore } from '../../store/authStore';
import { useGroupStore } from '../../store/groupStore';

const container = {
  animate: { transition: { staggerChildren: 0.05 } },
};
const cardVariant = {
  initial: { opacity: 0, y: 20, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { ease: 'easeOut' as const } },
};

export function GroupListPage() {
  const user = useAuthStore((s) => s.user);
  const activeGroupId = useGroupStore((s) => s.activeGroupId);

  const { data: groups, isLoading: loadingGroups } = useQuery({
    queryKey: queryKeys.groups,
    queryFn: groupsApi.list,
    staleTime: 5 * 60_000,
  });

  const { data: upcoming } = useQuery({
    queryKey: queryKeys.upcoming(48),
    queryFn: () => matchesApi.upcoming(48),
    staleTime: 60_000,
  });

  const { data: predictions } = useQuery({
    queryKey: queryKeys.predictions(activeGroupId ?? ''),
    queryFn: () => predictionsApi.list(activeGroupId!),
    staleTime: 5 * 60_000,
    enabled: !!activeGroupId,
  });

  const predictedIds = new Set(predictions?.map((p) => p.matchId) ?? []);
  const nextMatch = upcoming?.find((m) => m.status === MatchStatus.Scheduled);
  const liveMatches = upcoming?.filter((m) => m.status === MatchStatus.InProgress) ?? [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 space-y-6">

      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-linear-to-r from-green-600 to-emerald-600 rounded-2xl p-4 text-white shadow-lg shadow-green-200/50 relative overflow-hidden"
      >
        <motion.div
          animate={{ x: [0, 8, 0], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-6xl select-none pointer-events-none"
        >
          ⚽
        </motion.div>
        <p className="text-green-100 text-xs font-semibold uppercase tracking-wider">
          Olá, {user?.name?.split(' ')[0] ?? 'Jogador'} 👋
        </p>
        <h2 className="text-white font-bold text-lg mt-0.5">Copa do Mundo 2026</h2>
        <p className="text-green-100/80 text-xs mt-0.5">Faça seus palpites antes dos jogos!</p>
      </motion.div>

      {/* Live matches */}
      {liveMatches.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <h2 className="text-sm font-bold text-red-600 uppercase tracking-wider">Ao Vivo Agora</h2>
          </div>
          <div className="space-y-3">
            {liveMatches.map((m) => (
              <MatchCard key={m.id} match={m} prediction={predictions?.find((p) => p.matchId === m.id) ?? null} />
            ))}
          </div>
        </section>
      )}

      {/* Next match countdown */}
      {nextMatch && (
        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <Flame size={14} className="text-orange-500" />
            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Próximo Jogo</h2>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-linear-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden"
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-linear-to-r from-green-500/10 to-transparent" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400">{formatMatchDate(nextMatch.matchDate)}</span>
                {nextMatch.venue && (
                  <span className="text-xs text-slate-500 truncate max-w-30">{nextMatch.venue}</span>
                )}
              </div>
              <div className="flex items-center justify-center gap-6 mb-4">
                <div className="text-center">
                  <div className="text-2xl mb-1">
                    {getImageUrl(nextMatch.homeTeam?.flagUrl)
                      ? <img src={getImageUrl(nextMatch.homeTeam?.flagUrl)!} alt="" className="w-10 h-7 object-cover rounded mx-auto shadow" />
                      : <span className="text-2xl">🏳</span>}
                  </div>
                  <span className="text-sm font-bold">{nextMatch.homeTeam?.name ?? '?'}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-light text-slate-500">×</span>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">
                    {getImageUrl(nextMatch.awayTeam?.flagUrl)
                      ? <img src={getImageUrl(nextMatch.awayTeam?.flagUrl)!} alt="" className="w-10 h-7 object-cover rounded mx-auto shadow" />
                      : <span className="text-2xl">🏳</span>}
                  </div>
                  <span className="text-sm font-bold">{nextMatch.awayTeam?.name ?? '?'}</span>
                </div>
              </div>
              <CountdownBanner targetDate={nextMatch.matchDate} />
            </div>
          </motion.div>
        </section>
      )}

      {/* Upcoming matches */}
      {upcoming && upcoming.filter(m => m.status === MatchStatus.Scheduled).length > 0 && (
        <section>
          <div className="flex items-center gap-1.5 mb-3">
            <Clock size={14} className="text-slate-500" />
            <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Próximas 48h</h2>
          </div>
          <div className="space-y-3">
            {upcoming.filter(m => m.status === MatchStatus.Scheduled).slice(0, 5).map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                prediction={predictions?.find((p) => p.matchId === m.id) ?? null}
              />
            ))}
          </div>
        </section>
      )}

      {/* Groups grid */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Grupos</h2>
          <span className="text-xs text-slate-400">{groups?.length ?? 12} grupos</span>
        </div>

        {loadingGroups ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-2xl" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 gap-3"
          >
            {groups?.map((g) => (
              <motion.div key={g.name} variants={cardVariant}>
                <GroupCard group={g} predictedIds={predictedIds} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
}

function CountdownBanner({ targetDate }: { targetDate: string }) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);
  if (isExpired) return <p className="text-center text-xs text-slate-400">Jogo iniciado!</p>;
  return (
    <div className="flex justify-center gap-2">
      {[
        { v: days, l: 'dias' },
        { v: hours, l: 'horas' },
        { v: minutes, l: 'min' },
        { v: seconds, l: 'seg' },
      ].map(({ v, l }) => (
        <div key={l} className="flex flex-col items-center bg-white/10 rounded-xl px-3 py-2 min-w-13">
          <motion.span
            key={v}
            initial={{ y: -6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-xl font-bold tabular-nums"
          >
            {String(v).padStart(2, '0')}
          </motion.span>
          <span className="text-[9px] text-slate-400 mt-0.5">{l}</span>
        </div>
      ))}
    </div>
  );
}

function GroupCard({ group, predictedIds }: { group: GroupDto; predictedIds: Set<number> }) {
  const totalScheduled = group.matches.filter(
    (m) => m.status === MatchStatus.Scheduled && new Date(m.matchDate) > new Date()
  ).length;
  const unpredicted = group.matches.filter(
    (m) =>
      m.status === MatchStatus.Scheduled &&
      new Date(m.matchDate) > new Date() &&
      !predictedIds.has(m.id)
  ).length;

  const isBrazil = group.name === 'C';

  return (
    <Link to={`/groups/${group.name}`} className="block">
      <motion.div
        whileHover={{ y: -2, boxShadow: '0 12px 28px rgba(0,0,0,0.10)' }}
        whileTap={{ scale: 0.97 }}
        className={`rounded-2xl border p-3.5 transition-colors ${
          isBrazil
            ? 'border-green-300 bg-linear-to-br from-green-50 to-emerald-50 shadow-md shadow-green-100'
            : 'border-slate-100 bg-white shadow-sm'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold text-slate-700">
              {isBrazil ? '🇧🇷 ' : ''}Grupo {group.name}
            </span>
            {isBrazil && (
              <span className="text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                BRA
              </span>
            )}
          </div>
          <ChevronRight size={14} className="text-slate-300" />
        </div>

        {/* Flags 2×2 */}
        <div className="grid grid-cols-2 gap-1.5 mb-2.5">
          {group.teams.slice(0, 4).map((team) => (
            <div key={team.id} className="flex items-center gap-1.5">
              {getImageUrl(team.flagUrl) ? (
                <img
                  src={getImageUrl(team.flagUrl)!}
                  alt={team.name}
                  className="w-6 h-4 object-cover rounded-sm shadow-sm shrink-0"
                />
              ) : (
                <div className="w-6 h-4 rounded-sm bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-500 shrink-0">
                  {team.fifaCode}
                </div>
              )}
              <span className="text-[11px] text-slate-600 truncate leading-none">{team.name}</span>
            </div>
          ))}
        </div>

        {/* Footer badge */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400">{totalScheduled} jogos</span>
          {unpredicted > 0 ? (
            <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
              {unpredicted} sem palpite
            </span>
          ) : totalScheduled === 0 ? null : (
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
              ✓ completo
            </span>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
