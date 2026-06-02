import { motion } from 'framer-motion';
import { Crown, X, Clock } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { bolaoGroupsApi } from '../../api/bolaoGroups';
import { type BolaoGroupMemberDto, MemberRole, MemberStatus, queryKeys } from '../../types/api';
import { cn } from '../../utils/cn';
import { UserAvatar } from '../ui/UserAvatar';

interface Props {
  member: BolaoGroupMemberDto;
  groupId: string;
  isGroupAdmin: boolean;
  isSelf: boolean;
  index: number;
}

export function MemberRow({ member, groupId, isGroupAdmin, isSelf, index }: Props) {
  const qc = useQueryClient();
  const isPending = member.status === MemberStatus.Pending;

  const remove = useMutation({
    mutationFn: () => bolaoGroupsApi.removeMember(groupId, member.userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bolaoGroupMembers(groupId) });
      qc.invalidateQueries({ queryKey: queryKeys.bolaoGroup(groupId) });
      toast.success(`${member.userName} removido do grupo`);
    },
    onError: () => toast.error('Erro ao remover membro'),
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, ease: 'easeOut' }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors',
        isSelf ? 'bg-green-50 border-green-200' : 'bg-white border-slate-100',
        isPending && 'opacity-60'
      )}
    >
      {/* Avatar */}
      <UserAvatar photoUrl={member.userPhotoUrl} name={member.userName} size="md" />

      {/* Name + role */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={cn('font-semibold text-sm truncate', isSelf && 'text-green-700')}>
            {member.userName}
            {isSelf && (
              <span className="ml-1 text-[10px] bg-green-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                você
              </span>
            )}
          </span>
          {member.role === MemberRole.Admin && (
            <Crown size={13} className="text-amber-500 shrink-0" />
          )}
        </div>
        {isPending && (
          <span className="flex items-center gap-1 text-[11px] text-amber-500 mt-0.5">
            <Clock size={11} /> Aguardando aprovação
          </span>
        )}
      </div>

      {/* Remove button (only for group admins, not themselves) */}
      {isGroupAdmin && !isSelf && member.role !== MemberRole.Admin && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => remove.mutate()}
          disabled={remove.isPending}
          className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors shrink-0"
        >
          <X size={15} />
        </motion.button>
      )}
    </motion.div>
  );
}
