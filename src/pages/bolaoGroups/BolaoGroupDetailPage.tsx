import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ArrowLeft, LogOut, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { bolaoGroupsApi } from '../../api/bolaoGroups';
import { queryKeys, MemberRole } from '../../types/api';
import { useAuthStore } from '../../store/authStore';
import { RankingRow } from '../../components/ranking/RankingRow';
import { MemberRow } from '../../components/bolaoGroup/MemberRow';
import { InviteCard } from '../../components/bolaoGroup/InviteCard';

type Tab = 'ranking' | 'members' | 'invite';

const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: 'ranking', label: 'Ranking', emoji: '🏆' },
  { key: 'members', label: 'Membros', emoji: '👥' },
  { key: 'invite', label: 'Convidar', emoji: '🔗' },
];

export function BolaoGroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const [tab, setTab] = useState<Tab>('ranking');

  const { data: group, isLoading } = useQuery({
    queryKey: queryKeys.bolaoGroup(id!),
    queryFn: () => bolaoGroupsApi.get(id!),
    staleTime: 30_000,
    enabled: !!id,
  });

  const { data: ranking, isLoading: loadingRanking } = useQuery({
    queryKey: queryKeys.bolaoGroupRanking(id!),
    queryFn: () => bolaoGroupsApi.ranking(id!),
    staleTime: 30_000,
    enabled: !!id && tab === 'ranking',
  });

  const { data: members, isLoading: loadingMembers } = useQuery({
    queryKey: queryKeys.bolaoGroupMembers(id!),
    queryFn: () => bolaoGroupsApi.members(id!),
    staleTime: 30_000,
    enabled: !!id && tab === 'members',
  });

  const isAdmin = group?.myRole === MemberRole.Admin;

  const leave = useMutation({
    mutationFn: () => bolaoGroupsApi.leave(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bolaoGroups });
      toast.success('Você saiu do grupo');
      navigate('/meus-grupos', { replace: true });
    },
    onError: () => toast.error('Erro ao sair do grupo'),
  });

  const deleteGroup = useMutation({
    mutationFn: () => bolaoGroupsApi.delete(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.bolaoGroups });
      toast.success('Grupo excluído');
      navigate('/meus-grupos', { replace: true });
    },
    onError: () => toast.error('Erro ao excluir grupo'),
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <div className="skeleton h-9 w-36 rounded-xl" />
        <div className="skeleton h-24 rounded-2xl" />
        <div className="skeleton h-12 rounded-xl" />
        <div className="skeleton h-48 rounded-2xl" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-slate-400">
        <p className="text-4xl mb-3">🔍</p>
        <p>Grupo não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 space-y-4">
      {/* Back + Title */}
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-slate-600" />
        </motion.button>
        <div className="flex-1 min-w-0">
          <h1 className="font-black text-slate-800 text-lg truncate">{group.name}</h1>
          <p className="text-xs text-slate-400">{group.memberCount} membros · criado por {group.creatorName.split(' ')[0]}</p>
        </div>
      </div>

      {/* Description */}
      {group.description && (
        <p className="text-sm text-slate-500 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100">
          {group.description}
        </p>
      )}

      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
        {TABS.map(({ key, label, emoji }) => (
          <motion.button
            key={key}
            onClick={() => setTab(key)}
            className="flex-1 relative py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            {tab === key && (
              <motion.div
                layoutId="bolao-tab"
                className="absolute inset-0 bg-white rounded-lg shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className={`relative z-10 ${tab === key ? 'text-green-700' : 'text-slate-500'}`}>
              {emoji} {label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {/* Ranking tab */}
        {tab === 'ranking' && (
          <motion.div
            key="ranking"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {loadingRanking ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton h-16 rounded-2xl" />
              ))
            ) : ranking && ranking.length > 0 ? (
              ranking.map((entry, i) => (
                <RankingRow
                  key={entry.userId}
                  entry={entry}
                  isMe={entry.userId === userId}
                  index={i}
                />
              ))
            ) : (
              <EmptyState emoji="🏆" title="Sem pontuação ainda" subtitle="O ranking aparece após os primeiros jogos." />
            )}
          </motion.div>
        )}

        {/* Members tab */}
        {tab === 'members' && (
          <motion.div
            key="members"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {loadingMembers ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-14 rounded-xl" />
              ))
            ) : members && members.length > 0 ? (
              members.map((m, i) => (
                <MemberRow
                  key={m.userId}
                  member={m}
                  groupId={id!}
                  isGroupAdmin={isAdmin}
                  isSelf={m.userId === userId}
                  index={i}
                />
              ))
            ) : (
              <EmptyState emoji="👥" title="Nenhum membro" subtitle="Convide pessoas via link!" />
            )}
          </motion.div>
        )}

        {/* Invite tab */}
        {tab === 'invite' && (
          <motion.div
            key="invite"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <InviteCard
              groupId={id!}
              inviteCode={group.inviteCode}
              inviteLink={group.inviteLink}
              whatsAppShareUrl={group.whatsAppShareUrl}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Danger zone */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        {!isAdmin && (
          <button
            onClick={() => leave.mutate()}
            disabled={leave.isPending}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-orange-200 bg-orange-50 text-orange-600 font-semibold text-sm hover:bg-orange-100 transition-colors"
          >
            {leave.isPending ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
            Sair do grupo
          </button>
        )}
        {isAdmin && (
          <button
            onClick={() => {
              if (confirm(`Excluir "${group.name}"? Esta ação não pode ser desfeita.`))
                deleteGroup.mutate();
            }}
            disabled={deleteGroup.isPending}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors"
          >
            {deleteGroup.isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Excluir grupo
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <div className="text-center py-12 text-slate-400">
      <p className="text-4xl mb-3">{emoji}</p>
      <p className="font-semibold text-slate-500">{title}</p>
      <p className="text-sm mt-1">{subtitle}</p>
    </div>
  );
}
