import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface Props {
  points: number;
  isProcessed: boolean;
  className?: string;
}

export function ScoreBadge({ points, isProcessed, className }: Props) {
  if (!isProcessed) return null;

  const config =
    points === 3
      ? { label: '✅ Placar exato', cls: 'bg-green-100 text-green-700 border-green-200', pts: '+3 pts' }
      : points === 1
        ? { label: '🟡 Resultado certo', cls: 'bg-amber-100 text-amber-700 border-amber-200', pts: '+1 pt' }
        : { label: '❌ Errou', cls: 'bg-red-100 text-red-600 border-red-200', pts: '0 pts' };

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border',
        config.cls,
        className
      )}
    >
      {config.label}
      <span className="font-bold opacity-70">{config.pts}</span>
    </motion.span>
  );
}
