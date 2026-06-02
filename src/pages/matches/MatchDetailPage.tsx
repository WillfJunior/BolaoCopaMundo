import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { matchesApi } from '../../api/matches';
import { predictionsApi } from '../../api/predictions';
import { queryKeys, MatchStatus, MatchPhase } from '../../types/api';
import { PredictionInput } from '../../components/match/PredictionInput';
import { TeamFlag } from '../../components/match/MatchCard';
import { formatFullDate } from '../../utils/formatters';
import { useCountdown } from '../../hooks/useCountdown';

const phaseLabels: Record<MatchPhase, string> = {
  [MatchPhase.GroupStage]: '⚽ Fase de Grupos',
  [MatchPhase.RoundOf32]: '⚽ Rodada de 32',
  [MatchPhase.RoundOf16]: '🏆 Oitavas de Final',
  [MatchPhase.Quarterfinals]: '🏆 Quartas de Final',
  [MatchPhase.Semifinals]: '🔥 Semifinal',
  [MatchPhase.ThirdPlace]: '🥉 Terceiro Lugar',
  [MatchPhase.Final]: '🌟 Grande Final',
};

export function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const matchId = Number(id);

  const { data: match, isLoading: loadingMatch } = useQuery({
    queryKey: queryKeys.match(matchId),
    queryFn: () => matchesApi.get(matchId),
    staleTime: 30_000,
    enabled: !!matchId,
  });

  const { data: prediction = null, isLoading: loadingPred } = useQuery({
    queryKey: queryKeys.predictionForMatch(matchId),
    queryFn: () => predictionsApi.forMatch(matchId),
    staleTime: 5 * 60_000,
    enabled: !!matchId,
  });

  if (loadingMatch || loadingPred) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <div className="skeleton h-9 w-36 rounded-xl" />
        <div className="skeleton h-52 rounded-3xl" />
        <div className="skeleton h-40 rounded-2xl" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-slate-400">
        <p className="text-4xl mb-3">🔍</p>
        <p>Jogo não encontrado.</p>
      </div>
    );
  }

  const isScheduled = match.status === MatchStatus.Scheduled;
  const isLive = match.status === MatchStatus.InProgress;
  const isFinished = match.status === MatchStatus.Finished;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 space-y-4">
      {/* Back + Phase */}
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-slate-600" />
        </motion.button>
        <span className="text-sm font-medium text-slate-500">{phaseLabels[match.phase]}</span>
      </div>

      {/* Match hero card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl overflow-hidden shadow-xl ${
          isLive
            ? 'bg-linear-to-br from-green-700 to-emerald-800'
            : isFinished
              ? 'bg-linear-to-br from-slate-700 to-slate-800'
              : 'bg-linear-to-br from-slate-800 to-slate-900'
        }`}
      >
        {/* Live strip */}
        {isLive && (
          <div className="flex items-center justify-center gap-2 py-2 bg-green-500/20 border-b border-green-400/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            <span className="text-xs font-bold text-green-300 uppercase tracking-widest">Ao Vivo</span>
          </div>
        )}

        <div className="px-6 py-7">
          {/* Teams row */}
          <div className="flex items-center justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 flex flex-col items-center gap-3"
            >
              <TeamFlag team={match.homeTeam} size="lg" />
              <span className="font-bold text-white text-center text-sm leading-tight">
                {match.homeTeam?.name ?? 'A definir'}
              </span>
            </motion.div>

            {/* Score / VS */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              {isFinished || isLive ? (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
                  className={`text-4xl font-black tracking-widest tabular-nums ${
                    isLive ? 'text-green-300' : 'text-white'
                  }`}
                >
                  {match.homeScore} — {match.awayScore}
                </motion.div>
              ) : (
                <span className="text-3xl font-extralight text-white/30">×</span>
              )}
              {isScheduled && <CountdownDisplay targetDate={match.matchDate} />}
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 flex flex-col items-center gap-3"
            >
              <TeamFlag team={match.awayTeam} size="lg" />
              <span className="font-bold text-white text-center text-sm leading-tight">
                {match.awayTeam?.name ?? 'A definir'}
              </span>
            </motion.div>
          </div>

          {/* Meta info */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs text-white/50">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {formatFullDate(match.matchDate)}
            </span>
            {match.venue && (
              <span className="flex items-center gap-1">
                <MapPin size={11} />
                {match.venue}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Prediction */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <PredictionInput match={match} prediction={prediction} />
      </motion.div>
    </div>
  );
}

function CountdownDisplay({ targetDate }: { targetDate: string }) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);
  if (isExpired) return null;
  return (
    <div className="flex gap-1.5">
      {[
        { v: days, l: 'd' },
        { v: hours, l: 'h' },
        { v: minutes, l: 'm' },
        { v: seconds, l: 's' },
      ].map(({ v, l }) => (
        <div key={l} className="flex flex-col items-center bg-white/10 rounded-lg px-2 py-1 min-w-10">
          <span className="text-sm font-bold text-white tabular-nums">{String(v).padStart(2, '0')}</span>
          <span className="text-[9px] text-white/40">{l}</span>
        </div>
      ))}
    </div>
  );
}
