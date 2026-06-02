import { useNavigate } from 'react-router-dom';
import { MapPin, Pencil, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { type MatchDto, MatchStatus, type PredictionDto } from '../../types/api';
import { formatMatchDate, getImageUrl } from '../../utils/formatters';
import { ScoreBadge } from './ScoreBadge';
import { cn } from '../../utils/cn';

interface Props {
  match: MatchDto;
  prediction?: PredictionDto | null;
  showLink?: boolean;
}

export function MatchCard({ match, prediction, showLink = true }: Props) {
  const navigate = useNavigate();
  const isLive = match.status === MatchStatus.InProgress;
  const isFinished = match.status === MatchStatus.Finished;
  const isScheduled = match.status === MatchStatus.Scheduled;

  return (
    <motion.div
      whileHover={showLink ? { y: -2 } : {}}
      whileTap={showLink ? { scale: 0.985 } : {}}
      onClick={() => showLink && navigate(`/matches/${match.id}`)}
      className={cn(
        'bg-white rounded-2xl border transition-all duration-200 overflow-hidden',
        showLink && 'cursor-pointer',
        isLive
          ? 'border-green-300 shadow-md shadow-green-100'
          : 'border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200'
      )}
    >
      {/* Live bar */}
      {isLive && (
        <div className="h-0.5 bg-linear-to-r from-green-400 via-emerald-300 to-green-500" />
      )}

      <div className="p-4">
        {/* Status row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            {isLive ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                AO VIVO
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Clock size={10} />
                {formatMatchDate(match.matchDate)}
              </span>
            )}
          </div>
          {match.groupName && (
            <span className="text-[10px] text-slate-400 font-medium bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
              Grupo {match.groupName}
            </span>
          )}
        </div>

        {/* Teams + Score */}
        <div className="flex items-center gap-3">
          {/* Home */}
          <div className="flex-1 flex items-center gap-2">
            <TeamFlag team={match.homeTeam} size="sm" />
            <span className="text-sm font-semibold text-slate-700 leading-tight">
              {match.homeTeam?.name ?? 'A definir'}
            </span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-1 shrink-0">
            {isFinished || isLive ? (
              <div
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-lg tabular-nums',
                  isLive
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-slate-50 text-slate-700 border border-slate-100'
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
          <div className="flex-1 flex items-center gap-2 justify-end">
            <span className="text-sm font-semibold text-slate-700 leading-tight text-right">
              {match.awayTeam?.name ?? 'A definir'}
            </span>
            <TeamFlag team={match.awayTeam} size="sm" />
          </div>
        </div>

        {/* Venue */}
        {match.venue && (
          <div className="flex items-center justify-center gap-1 mt-2.5 text-[10px] text-slate-400">
            <MapPin size={9} />
            <span>{match.venue}</span>
          </div>
        )}

        {/* Prediction row */}
        {(prediction || isScheduled) && (
          <div className={cn(
            'mt-3 pt-2.5 border-t flex items-center justify-between',
            'border-slate-100'
          )}>
            {prediction ? (
              <>
                <span className="text-xs text-slate-500">
                  Seu palpite:{' '}
                  <span className="font-bold text-slate-700">
                    {prediction.homeScore} — {prediction.awayScore}
                  </span>
                </span>
                <ScoreBadge points={prediction.points} isProcessed={prediction.isProcessed} />
              </>
            ) : isScheduled ? (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <Pencil size={11} />
                Toque para palpitar
              </span>
            ) : null}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function TeamFlag({
  team,
  size = 'md',
}: {
  team: MatchDto['homeTeam'];
  size?: 'sm' | 'md' | 'lg';
}) {
  const dims = size === 'sm' ? 'w-8 h-5.5' : size === 'lg' ? 'w-16 h-11' : 'w-10 h-7';
  const textSize = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-sm' : 'text-xs';

  if (!team) {
    return (
      <div className={cn(dims, 'rounded bg-slate-100 flex items-center justify-center text-slate-300', textSize)}>
        ?
      </div>
    );
  }
  const flagSrc = getImageUrl(team.flagUrl);
  if (flagSrc) {
    return (
      <img
        src={flagSrc}
        alt={team.name}
        className={cn(dims, 'object-cover rounded shadow-sm shrink-0')}
      />
    );
  }
  return (
    <div className={cn(dims, 'rounded bg-green-100 flex items-center justify-center font-bold text-green-700 shrink-0', textSize)}>
      {team.fifaCode}
    </div>
  );
}
