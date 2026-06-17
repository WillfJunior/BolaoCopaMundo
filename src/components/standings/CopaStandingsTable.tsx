import { motion } from 'framer-motion';
import { UserAvatar } from '../ui/UserAvatar';
import type { TeamStandingDto } from '../../types/api';

interface CopaStandingsTableProps {
  teams: TeamStandingDto[];
  isLoading?: boolean;
}

export function CopaStandingsTable({ teams, isLoading }: CopaStandingsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-14 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {/* Header */}
      <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <div className="col-span-1 text-center">#</div>
        <div className="col-span-5">Time</div>
        <div className="col-span-1 text-center">J</div>
        <div className="col-span-1 text-center">SG</div>
        <div className="col-span-1 text-center">GC</div>
        <div className="col-span-2 text-right">Pts</div>
      </div>

      {/* Teams */}
      {teams.map((team, i) => (
        <motion.div
          key={team.teamId}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`grid grid-cols-12 gap-2 px-3 py-2.5 rounded-lg items-center transition-colors ${
            i === 0
              ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200'
              : i === 1
                ? 'bg-gradient-to-r from-slate-50 to-zinc-50 border border-slate-200'
                : i === 2
                  ? 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200'
                  : 'bg-white border border-slate-100 hover:bg-slate-50'
          }`}
        >
          {/* Position */}
          <div className="col-span-1 text-center">
            <div className="flex items-center justify-center">
              {i === 0 && <span className="text-lg">🥇</span>}
              {i === 1 && <span className="text-lg">🥈</span>}
              {i === 2 && <span className="text-lg">🥉</span>}
              {i > 2 && (
                <span className="text-xs font-bold text-slate-400 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                  {i + 1}
                </span>
              )}
            </div>
          </div>

          {/* Team */}
          <div className="col-span-5 flex items-center gap-2 min-w-0">
            {team.flagUrl && (
              <img
                src={team.flagUrl}
                alt={team.teamName}
                className="w-6 h-4 rounded object-cover flex-shrink-0"
              />
            )}
            <span className="text-sm font-semibold text-slate-700 truncate">
              {team.teamName}
            </span>
          </div>

          {/* Matches */}
          <div className="col-span-1 text-center text-xs font-medium text-slate-600">
            {team.played}
          </div>

          {/* Goals For */}
          <div className="col-span-1 text-center text-xs font-medium text-slate-600">
            {team.goalsFor}
          </div>

          {/* Goals Against */}
          <div className="col-span-1 text-center text-xs font-medium text-slate-600">
            {team.goalsAgainst}
          </div>

          {/* Points */}
          <div className="col-span-2 text-right">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 border border-green-200">
              <span className="text-lg font-black text-green-700">{team.points}</span>
              <span className="text-[10px] font-bold text-green-600">pts</span>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Legend */}
      <div className="mt-4 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 text-[11px] text-blue-700 space-y-1">
        <p className="font-semibold">Legenda:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>J = Jogos</div>
          <div>SG = Saldo de Gols</div>
          <div>GC = Gols Contra</div>
          <div>Pts = Pontos</div>
        </div>
      </div>
    </div>
  );
}
