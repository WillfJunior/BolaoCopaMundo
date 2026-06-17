import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { UserAvatar } from '../ui/UserAvatar';
import type { RealTimeRankingEntryDto } from '../../types/api';

interface RealTimeRankingRowProps {
  entry: RealTimeRankingEntryDto;
  isMe?: boolean;
  index: number;
}

export function RealTimeRankingRow({ entry, isMe, index }: RealTimeRankingRowProps) {
  const positionChange = entry.positionChange;
  const isGainingPosition = positionChange > 0;
  const isLosingPosition = positionChange < 0;
  const totalPointsNow = entry.totalPoints + entry.momentaryPoints;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`relative rounded-2xl border px-4 py-3 transition-all ${
        isMe
          ? 'border-green-300 bg-linear-to-r from-green-50 to-emerald-50 shadow-md shadow-green-200/50'
          : entry.isLeader
            ? 'border-amber-200 bg-linear-to-r from-amber-50 to-yellow-50'
            : 'border-slate-100 bg-white hover:bg-slate-50'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Position */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
          <motion.span
            key={entry.momentaryPosition}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="text-sm font-black text-slate-700"
          >
            #{entry.momentaryPosition}
          </motion.span>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <UserAvatar
              photoUrl={entry.userPhotoUrl}
              name={entry.userName}
              size="sm"
              className="border border-white"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-700 truncate">
                {entry.userName}
              </p>
              <p className="text-xs text-slate-500">
                {entry.exactScores} acertos · {entry.correctOutcomes} resultados
              </p>
            </div>
          </div>
        </div>

        {/* Position Change */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 0.5,
            repeat: positionChange !== 0 ? Infinity : 0,
            repeatDelay: 2,
          }}
          className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-colors ${
            isGainingPosition
              ? 'bg-green-100 border-2 border-green-300'
              : isLosingPosition
                ? 'bg-red-100 border-2 border-red-300'
                : 'bg-slate-100 border-2 border-slate-200'
          }`}
        >
          {positionChange > 0 ? (
            <>
              <TrendingUp size={16} className="text-green-600" />
              <span className="text-xs font-bold text-green-600">+{positionChange}</span>
            </>
          ) : positionChange < 0 ? (
            <>
              <TrendingDown size={16} className="text-red-600" />
              <span className="text-xs font-bold text-red-600">{positionChange}</span>
            </>
          ) : (
            <span className="text-xs font-bold text-slate-500">—</span>
          )}
        </motion.div>
      </div>

      {/* Points Section */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        {/* Total Points */}
        <div className="flex items-baseline gap-1">
          <span className="text-xs text-slate-500">Total:</span>
          <motion.span
            key={`total-${totalPointsNow}`}
            initial={{ scale: 1.1, color: '#16a34a' }}
            animate={{ scale: 1, color: '#1f2937' }}
            transition={{ duration: 0.3 }}
            className="text-lg font-black text-slate-800"
          >
            {entry.totalPoints}
          </motion.span>
          <span className="text-xs text-slate-500">pts</span>
        </div>

        {/* Momentary Points */}
        {entry.momentaryPoints > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-green-400 to-emerald-500 text-white"
          >
            <span className="text-base leading-none">⚡</span>
            <div className="text-right">
              <motion.div
                key={entry.momentaryPoints}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="text-sm font-black leading-none"
              >
                +{entry.momentaryPoints}
              </motion.div>
              <p className="text-[10px] leading-none opacity-90">agora</p>
            </div>
          </motion.div>
        )}

        {/* Leader Badge */}
        {entry.isLeader && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-200 text-amber-800"
          >
            <span className="text-base leading-none">👑</span>
            <span className="text-xs font-bold">Líder</span>
          </motion.div>
        )}
      </div>

      {/* My Badge */}
      {isMe && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-green-600 text-white text-[10px] font-bold"
        >
          Você
        </motion.div>
      )}
    </motion.div>
  );
}
