import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ArrowLeft, LogOut, Trash2, Loader2, CheckCircle, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { bolaoGroupsApi } from '../../api/bolaoGroups';
import { groupsApi } from '../../api/groups';
import { predictionsApi } from '../../api/predictions';
import { queryKeys, MemberRole, MatchStatus, MemberStatus } from '../../types/api';
import { useAuthStore } from '../../store/authStore';
import { useGroupStore } from '../../store/groupStore';
import { RankingRow } from '../../components/ranking/RankingRow';
import { MemberRow } from '../../components/bolaoGroup/MemberRow';
import { InviteCard } from '../../components/bolaoGroup/InviteCard';
import { MatchCard } from '../../components/match/MatchCard';

type Tab = 'ranking' | 'matches' | 'members' | 'invite' | 'rules';

const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: 'ranking', label: 'Ranking',  emoji: '🏆' },
  { key: 'matches', label: 'Jogos',    emoji: '⚽' },
  { key: 'members', label: 'Membros',  emoji: '👥' },
  { key: 'invite',  label: 'Convidar', emoji: '🔗' },
  { key: 'rules',   label: 'Regras',   emoji: '📋' },
];

export function BolaoGroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const userId = useAuthStore((s) => s.user?.id);
  const setActiveGroup = useGroupStore((s) => s.setActiveGroup);
  const [tab, setTab] = useState<Tab>('ranking');

  const { data: group, isLoading } = useQuery({
    queryKey: queryKeys.bolaoGroup(id!),
    queryFn: () => bolaoGroupsApi.get(id!),
    staleTime: 30_000,
    enabled: !!id,
  });

  // Set active group context whenever this page is open
  useEffect(() => {
    if (group) setActiveGroup(group.id, group.name);
  }, [group, setActiveGroup]);

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

  const { data: pendingMembers } = useQuery({
    queryKey: [...queryKeys.bolaoGroupMembers(id!), 'pending'],
    queryFn: () => bolaoGroupsApi.pendingMembers(id!),
    staleTime: 30_000,
    enabled: !!id && tab === 'members',
  });

  const approve = useMutation({
    mutationFn: (userId: string) => bolaoGroupsApi.approveMember(id!, userId),
    onSuccess: (member) => {
      qc.invalidateQueries({ queryKey: queryKeys.bolaoGroupMembers(id!) });
      qc.invalidateQueries({ queryKey: queryKeys.bolaoGroup(id!) });
      toast.success(`${member.userName} aprovado!`);
    },
    onError: () => toast.error('Erro ao aprovar membro'),
  });

  const { data: matchGroups } = useQuery({
    queryKey: queryKeys.groups,
    queryFn: groupsApi.list,
    staleTime: 5 * 60_000,
    enabled: tab === 'matches',
  });

  const { data: predictions } = useQuery({
    queryKey: queryKeys.predictions(id!),
    queryFn: () => predictionsApi.list(id!),
    staleTime: 60_000,
    enabled: !!id && tab === 'matches',
  });

  const predictionMap = new Map(predictions?.map((p) => [p.matchId, p]) ?? []);

  const allMatches = matchGroups?.flatMap((g) => g.matches) ?? [];
  const scheduledMatches = allMatches
    .filter((m) => m.status === MatchStatus.Scheduled || m.status === MatchStatus.InProgress)
    .sort((a, b) => new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime());
  const finishedMatches = allMatches
    .filter((m) => m.status === MatchStatus.Finished)
    .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime());

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
      <div className="flex rounded-xl bg-slate-100 p-1 gap-0.5">
        {TABS.map(({ key, label, emoji }) => (
          <motion.button
            key={key}
            onClick={() => setTab(key)}
            className="flex-1 relative py-2 rounded-lg transition-colors"
          >
            {tab === key && (
              <motion.div
                layoutId="bolao-tab"
                className="absolute inset-0 bg-white rounded-lg shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className={`relative z-10 flex flex-col items-center gap-0.5 ${tab === key ? 'text-green-700' : 'text-slate-500'}`}>
              <span className="text-base leading-none">{emoji}</span>
              <span className="text-[10px] font-semibold leading-none">{label}</span>
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

        {/* Matches tab */}
        {tab === 'matches' && (
          <motion.div
            key="matches"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {scheduledMatches.length > 0 && (
              <section className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Próximos jogos</p>
                {scheduledMatches.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    prediction={predictionMap.get(m.id)}
                  />
                ))}
              </section>
            )}
            {finishedMatches.length > 0 && (
              <section className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Jogos encerrados</p>
                {finishedMatches.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    prediction={predictionMap.get(m.id)}
                  />
                ))}
              </section>
            )}
            {scheduledMatches.length === 0 && finishedMatches.length === 0 && (
              <EmptyState emoji="⚽" title="Nenhum jogo disponível" subtitle="Os jogos aparecerão aqui em breve." />
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
            className="space-y-4"
          >
            {/* Pending section — admin only */}
            {isAdmin && pendingMembers && pendingMembers.length > 0 && (
              <section className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  <Clock size={13} className="text-amber-500" />
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                    Aguardando aprovação ({pendingMembers.length})
                  </p>
                </div>
                {pendingMembers.map((m) => (
                  <div
                    key={m.userId}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50"
                  >
                    <div className="w-9 h-9 rounded-full bg-amber-200 flex items-center justify-center text-sm font-bold text-amber-700 shrink-0">
                      {m.userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-1 text-sm font-semibold text-slate-700 truncate">
                      {m.userName}
                    </span>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => approve.mutate(m.userId)}
                        disabled={approve.isPending}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors disabled:opacity-60"
                      >
                        {approve.isPending
                          ? <Loader2 size={12} className="animate-spin" />
                          : <CheckCircle size={12} />}
                        Aprovar
                      </button>
                      <button
                        onClick={() => {
                          qc.invalidateQueries({ queryKey: queryKeys.bolaoGroupMembers(id!) });
                          bolaoGroupsApi.removeMember(id!, m.userId).then(() => {
                            qc.invalidateQueries({ queryKey: queryKeys.bolaoGroupMembers(id!) });
                            qc.invalidateQueries({ queryKey: queryKeys.bolaoGroup(id!) });
                            toast.success(`${m.userName} rejeitado`);
                          });
                        }}
                        className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="border-t border-slate-100 pt-2" />
              </section>
            )}

            {/* Active members */}
            <section className="space-y-2">
              {loadingMembers ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-14 rounded-xl" />
                ))
              ) : members && members.filter(m => m.status === MemberStatus.Active).length > 0 ? (
                members
                  .filter(m => m.status === MemberStatus.Active)
                  .map((m, i) => (
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
                <EmptyState emoji="👥" title="Nenhum membro ativo" subtitle="Convide pessoas via link!" />
              )}
            </section>
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

        {/* Rules tab */}
        {tab === 'rules' && (
          <motion.div
            key="rules"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {/* Header card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              className="relative overflow-hidden rounded-2xl bg-linear-to-br from-green-600 to-emerald-700 p-5 text-white shadow-lg shadow-green-200"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                className="absolute -right-8 -top-8 w-28 h-28 border-2 border-white/10 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute -left-6 -bottom-6 w-20 h-20 border-2 border-white/10 rounded-full"
              />
              <div className="relative">
                <p className="text-2xl mb-1">📋</p>
                <h3 className="text-lg font-black">Regras do Bolão</h3>
                <p className="text-green-100 text-xs mt-0.5">Como a pontuação funciona</p>
              </div>
            </motion.div>

            {/* Scoring rules */}
            {[
              {
                delay: 0.1,
                icon: '🎯',
                points: 3,
                label: 'Placar Exato',
                desc: 'Você acertou exatamente o placar do jogo.',
                color: 'from-green-50 to-emerald-50',
                border: 'border-green-200',
                badge: 'bg-green-600 text-white',
                text: 'text-green-800',
                sub: 'text-green-600',
              },
              {
                delay: 0.18,
                icon: '✅',
                points: 1,
                label: 'Resultado Certo',
                desc: 'Você acertou quem venceu (ou o empate), mas errou o placar.',
                color: 'from-amber-50 to-yellow-50',
                border: 'border-amber-200',
                badge: 'bg-amber-500 text-white',
                text: 'text-amber-800',
                sub: 'text-amber-600',
              },
              {
                delay: 0.26,
                icon: '❌',
                points: 0,
                label: 'Resultado Errado',
                desc: 'Você errou o resultado do jogo.',
                color: 'from-slate-50 to-zinc-50',
                border: 'border-slate-200',
                badge: 'bg-slate-400 text-white',
                text: 'text-slate-700',
                sub: 'text-slate-500',
              },
            ].map(({ delay, icon, points, label, desc, color, border, badge, text, sub }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay, ease: 'easeOut' }}
                className={`flex items-center gap-4 rounded-2xl bg-linear-to-r ${color} border ${border} p-4 shadow-sm`}
              >
                <div className="text-2xl w-10 text-center shrink-0">{icon}</div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm ${text}`}>{label}</p>
                  <p className={`text-xs mt-0.5 leading-snug ${sub}`}>{desc}</p>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: delay + 0.1, type: 'spring', stiffness: 400, damping: 20 }}
                  className={`shrink-0 w-11 h-11 rounded-xl ${badge} flex flex-col items-center justify-center shadow-md`}
                >
                  <span className="text-lg font-black leading-none">{points}</span>
                  <span className="text-[9px] font-semibold opacity-80 leading-none">pts</span>
                </motion.div>
              </motion.div>
            ))}

            {/* Timing notice */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36 }}
              className="flex items-start gap-3 rounded-2xl bg-slate-800 p-4 shadow-md"
            >
              <motion.span
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ delay: 0.6, duration: 0.6, repeat: Infinity, repeatDelay: 4 }}
                className="text-xl shrink-0 mt-0.5"
              >
                ⏱️
              </motion.span>
              <div>
                <p className="text-white text-sm font-bold">Atualização automática</p>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  A pontuação é calculada automaticamente. Pode levar até{' '}
                  <span className="text-green-400 font-semibold">5 minutos</span> após
                  o término do jogo para aparecer no ranking.
                </p>
              </div>
            </motion.div>
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
