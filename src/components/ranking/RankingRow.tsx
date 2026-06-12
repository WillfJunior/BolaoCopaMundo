import { motion } from 'framer-motion';
import { type RankingEntryDto } from '../../types/api';
import { cn } from '../../utils/cn';
import { UserAvatar } from '../ui/UserAvatar';

interface Props {
  entry: RankingEntryDto;
  isMe: boolean;
  index: number;
}

const medals = ['🥇', '🥈', '🥉'];
const podiumColors = [
  'from-amber-50 to-yellow-50 border-amber-200',
  'from-slate-50 to-zinc-50 border-slate-200',
  'from-orange-50 to-amber-50/50 border-orange-200',
];

export function RankingRow({ entry, isMe, index }: Props) {
  const medal = entry.position <= 3 ? medals[entry.position - 1] : null;
  const isPodium = entry.position <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, ease: 'easeOut' as const }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all',
        isMe
          ? 'bg-linear-to-r from-green-50 to-emerald-50 border-green-300 shadow-sm shadow-green-100'
          : isPodium
            ? `bg-linear-to-r ${podiumColors[entry.position - 1]} shadow-sm`
            : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'
      )}
    >
      {/* Position */}
      <div className="w-8 flex justify-center shrink-0">
        {medal ? (
          <motion.span
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.04 + 0.1, type: 'spring', stiffness: 400 }}
            className="text-xl"
          >
            {medal}
          </motion.span>
        ) : (
          <span className={cn('text-sm font-bold', isMe ? 'text-green-600' : 'text-slate-400')}>
            {entry.position}
          </span>
        )}
      </div>

      {/* Avatar */}
      <UserAvatar
        photoUrl={entry.userPhotoUrl}
        name={entry.userName}
        size="md"
        className={isMe ? 'ring-2 ring-green-400 ring-offset-1' : undefined}
      />

      {/* Name + stats */}
      <div className="flex-1 min-w-0">
        <p className={cn('font-semibold text-sm truncate', isMe ? 'text-green-700' : 'text-slate-800')}>
          {entry.userName}
          {isMe && (
            <span className="ml-1.5 text-[10px] font-bold bg-green-600 text-white px-1.5 py-0.5 rounded-full">
              você
            </span>
          )}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          ✅ {entry.exactScores} exatos · 🟡 {entry.correctOutcomes} result.
          {entry.errors != null && ` · ❌ ${entry.errors} erros`}
        </p>
      </div>

      {/* Points */}
      <div className="text-right shrink-0">
        <motion.p
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * 0.04 + 0.15 }}
          className={cn(
            'text-xl font-black tabular-nums',
            isMe ? 'text-green-600' : isPodium ? 'text-amber-600' : 'text-slate-700'
          )}
        >
          {entry.totalPoints}
        </motion.p>
        <p className="text-[10px] text-slate-400">pontos</p>
      </div>
    </motion.div>
  );
}
