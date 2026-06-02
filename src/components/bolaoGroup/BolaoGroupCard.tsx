import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { type BolaoGroupDto, MemberRole } from '../../types/api';

interface Props {
  group: BolaoGroupDto;
  index: number;
}

export function BolaoGroupCard({ group, index }: Props) {
  const navigate = useNavigate();
  const isAdmin = group.myRole === MemberRole.Admin;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/meus-grupos/${group.id}`)}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 cursor-pointer hover:border-green-200 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Avatar / initial */}
        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-lg font-black shrink-0 shadow-md shadow-green-200">
          {group.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-slate-800 truncate">{group.name}</h3>
            {isAdmin && (
              <Crown size={13} className="text-amber-500 shrink-0" />
            )}
          </div>
          {group.description && (
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{group.description}</p>
          )}
          <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-500">
            <Users size={12} />
            <span>{group.memberCount} {group.memberCount === 1 ? 'membro' : 'membros'}</span>
            <span className="text-slate-300 mx-1">·</span>
            <span className="text-slate-400">por {group.creatorName.split(' ')[0]}</span>
          </div>
        </div>

        <ChevronRight size={16} className="text-slate-300 mt-1 shrink-0" />
      </div>
    </motion.div>
  );
}
