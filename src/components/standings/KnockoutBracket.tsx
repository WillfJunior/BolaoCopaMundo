import { useQueries } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2 } from 'lucide-react';
import { matchesApi } from '../../api/matches';
import { MatchPhase, MatchStatus, type MatchDto } from '../../types/api';
import { TeamFlag } from '../match/MatchCard';
import { formatMatchDate } from '../../utils/formatters';
import { cn } from '../../utils/cn';

const KNOCKOUT_PHASES = [
  { id: MatchPhase.RoundOf32,     label: 'Rodada 32',        grid: true  },
  { id: MatchPhase.RoundOf16,     label: 'Oitavas de Final', grid: true  },
  { id: MatchPhase.Quarterfinals, label: 'Quartas de Final', grid: false },
  { id: MatchPhase.Semifinals,    label: 'Semifinal',        grid: false },
  { id: MatchPhase.ThirdPlace,    label: '3º Lugar',         grid: false },
  { id: MatchPhase.Final,         label: 'Final',            grid: false },
] as const;

function CompactCard({ match }: { match: MatchDto }) {
  const isFinished = match.status === MatchStatus.Finished;
  const isLive = match.status === MatchStatus.InProgress;
  const homeWon = isFinished && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWon = isFinished && (match.awayScore ?? 0) > (match.homeScore ?? 0);

  return (
    <div
      className={cn(
        'rounded-xl border bg-white overflow-hidden',
        isLive ? 'border-green-300 shadow-sm shadow-green-100' : 'border-slate-100 shadow-sm',
      )}
    >
      {isLive && (
        <div className="h-0.5 bg-linear-to-r from-green-400 to-emerald-400" />
      )}
      <div className="p-2.5 space-y-1.5">
        {/* Home */}
        <div className={cn('flex items-center gap-1.5 px-1 py-0.5 rounded-md', homeWon && 'bg-green-50')}>
          <TeamFlag team={match.homeTeam} size="sm" />
          <span className={cn('text-[11px] font-semibold flex-1 min-w-0 truncate', homeWon ? 'text-green-800' : 'text-slate-700')}>
            {match.homeTeam?.name ?? 'A definir'}
          </span>
          {(isFinished || isLive) && (
            <span className={cn('text-sm font-black tabular-nums shrink-0', homeWon ? 'text-green-700' : 'text-slate-500')}>
              {match.homeScore}
            </span>
          )}
        </div>

        {/* Away */}
        <div className={cn('flex items-center gap-1.5 px-1 py-0.5 rounded-md', awayWon && 'bg-green-50')}>
          <TeamFlag team={match.awayTeam} size="sm" />
          <span className={cn('text-[11px] font-semibold flex-1 min-w-0 truncate', awayWon ? 'text-green-800' : 'text-slate-700')}>
            {match.awayTeam?.name ?? 'A definir'}
          </span>
          {(isFinished || isLive) && (
            <span className={cn('text-sm font-black tabular-nums shrink-0', awayWon ? 'text-green-700' : 'text-slate-500')}>
              {match.awayScore}
            </span>
          )}
        </div>

        {/* Footer */}
        {!isFinished && !isLive && (
          <div className="flex items-center gap-1 text-[9px] text-slate-400 pt-0.5">
            <Clock size={8} />
            <span>{formatMatchDate(match.matchDate)}</span>
          </div>
        )}
        {isLive && (
          <div className="flex items-center gap-1 text-[9px] font-bold text-green-600">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
            </span>
            AO VIVO
          </div>
        )}
        {match.matchLabel && (
          <div className="text-[9px] text-slate-300 font-medium truncate">{match.matchLabel}</div>
        )}
      </div>
    </div>
  );
}

function FullCard({ match, isFinal = false }: { match: MatchDto; isFinal?: boolean }) {
  const isFinished = match.status === MatchStatus.Finished;
  const isLive = match.status === MatchStatus.InProgress;
  const homeWon = isFinished && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWon = isFinished && (match.awayScore ?? 0) > (match.homeScore ?? 0);

  return (
    <div
      className={cn(
        'rounded-2xl border bg-white overflow-hidden',
        isFinal && 'ring-2 ring-amber-200',
        isLive ? 'border-green-300 shadow-md shadow-green-100' : 'border-slate-100 shadow-sm',
      )}
    >
      {isLive && (
        <div className="h-0.5 bg-linear-to-r from-green-400 via-emerald-300 to-green-500" />
      )}
      {isFinal && !isLive && (
        <div className="h-0.5 bg-linear-to-r from-amber-300 via-yellow-300 to-amber-300" />
      )}

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-3">
          <div>
            {isLive ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                AO VIVO
              </span>
            ) : isFinished ? (
              <span className="text-[11px] font-medium text-slate-400">Encerrado</span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock size={11} />
                {formatMatchDate(match.matchDate)}
              </span>
            )}
          </div>
          {match.matchLabel && (
            <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
              {match.matchLabel}
            </span>
          )}
        </div>

        {/* Teams + score */}
        <div className="flex items-center gap-2">
          {/* Home */}
          <div className={cn('flex-1 flex items-center gap-2 px-2 py-1.5 rounded-xl', homeWon && 'bg-green-50')}>
            <TeamFlag team={match.homeTeam} size="md" />
            <span className={cn('text-sm font-bold truncate', homeWon ? 'text-green-800' : 'text-slate-700')}>
              {match.homeTeam?.name ?? 'A definir'}
            </span>
          </div>

          {/* Score */}
          <div className="shrink-0">
            {isFinished || isLive ? (
              <div
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-lg tabular-nums',
                  isLive
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-slate-50 text-slate-700 border border-slate-100',
                )}
              >
                <span>{match.homeScore}</span>
                <span className="text-slate-300 text-sm font-light">—</span>
                <span>{match.awayScore}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-slate-200 text-slate-300 font-medium text-sm">
                <span>?</span>
                <span className="text-slate-200">—</span>
                <span>?</span>
              </div>
            )}
          </div>

          {/* Away */}
          <div className={cn('flex-1 flex items-center gap-2 justify-end px-2 py-1.5 rounded-xl', awayWon && 'bg-green-50')}>
            <span className={cn('text-sm font-bold truncate text-right', awayWon ? 'text-green-800' : 'text-slate-700')}>
              {match.awayTeam?.name ?? 'A definir'}
            </span>
            <TeamFlag team={match.awayTeam} size="md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function KnockoutBracket() {
  const results = useQueries({
    queries: KNOCKOUT_PHASES.map(({ id }) => ({
      queryKey: ['matches', 'phase', id],
      queryFn: () => matchesApi.byPhase(id),
      staleTime: 5 * 60_000,
    })),
  });

  const isLoading = results.some((r) => r.isLoading && !r.data);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-40 rounded-2xl" />
        ))}
      </div>
    );
  }

  const phases = KNOCKOUT_PHASES.map((phase, i) => ({
    ...phase,
    matches: results[i].data ?? [],
  })).filter((p) => p.matches.length > 0);

  if (phases.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="text-4xl mb-3">⚔️</p>
        <p className="font-semibold text-slate-500">Mata-mata ainda não começou</p>
        <p className="text-sm mt-1">Os jogos aparecerão aqui quando a fase eliminatória iniciar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {phases.map(({ id, label, grid, matches }, phaseIdx) => {
        const finished = matches.filter((m) => m.status === MatchStatus.Finished).length;
        const live = matches.filter((m) => m.status === MatchStatus.InProgress).length;
        const allDone = finished === matches.length && matches.length > 0;
        const hasLive = live > 0;
        const isFinalPhase = id === MatchPhase.Final;

        return (
          <motion.section
            key={id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: phaseIdx * 0.08, ease: 'easeOut' }}
            className="space-y-3"
          >
            {/* Phase header */}
            <div className="flex items-center justify-between px-1">
              <h3 className={cn('font-black text-base', isFinalPhase ? 'text-amber-700' : 'text-slate-800')}>
                {isFinalPhase ? '🏆 ' : ''}{label}
              </h3>
              <div className="flex items-center gap-1.5">
                {hasLive && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                    </span>
                    Ao vivo
                  </span>
                )}
                {!hasLive && allDone && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={10} />
                    Concluída
                  </span>
                )}
                {!hasLive && !allDone && finished > 0 && (
                  <span className="text-[10px] font-medium text-slate-400">
                    {finished}/{matches.length}
                  </span>
                )}
              </div>
            </div>

            {/* Match cards */}
            {grid ? (
              <div className="grid grid-cols-2 gap-2">
                {matches.map((match) => (
                  <CompactCard key={match.id} match={match} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {matches.map((match) => (
                  <FullCard key={match.id} match={match} isFinal={isFinalPhase} />
                ))}
              </div>
            )}
          </motion.section>
        );
      })}
    </div>
  );
}
