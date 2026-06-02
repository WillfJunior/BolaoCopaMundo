import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Users, LogIn, CheckCircle, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { bolaoGroupsApi } from '../../api/bolaoGroups';
import { queryKeys, MemberStatus } from '../../types/api';
import { useAuthStore } from '../../store/authStore';

export function JoinGroupPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  const { data: info, isLoading, isError } = useQuery({
    queryKey: queryKeys.bolaoInvite(code!),
    queryFn: () => bolaoGroupsApi.inviteInfo(code!),
    enabled: !!code,
    retry: 1,
  });

  const join = useMutation({
    mutationFn: () => bolaoGroupsApi.join(code!),
    onSuccess: (group) => {
      toast.success(`Você entrou em "${group.name}"!`);
      navigate(`/meus-grupos/${group.id}`, { replace: true });
    },
    onError: (err: { response?: { data?: { message?: string } } }) =>
      toast.error(err.response?.data?.message ?? 'Erro ao entrar no grupo'),
  });

  const handleJoin = () => {
    if (!token) {
      navigate(`/login?redirect=/join/${code}`);
      return;
    }
    join.mutate();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-green-600/15 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 12, repeat: Infinity, delay: 2 }}
        className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        {isLoading ? (
          <div className="bg-white/95 rounded-3xl p-10 text-center shadow-2xl">
            <Loader2 size={36} className="animate-spin text-green-500 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Carregando convite...</p>
          </div>
        ) : isError ? (
          <div className="bg-white/95 rounded-3xl p-8 text-center shadow-2xl space-y-4">
            <AlertCircle size={48} className="text-red-400 mx-auto" />
            <div>
              <h2 className="text-lg font-bold text-slate-800">Link inválido</h2>
              <p className="text-sm text-slate-400 mt-1">
                Este convite não existe ou expirou.
              </p>
            </div>
            <Link
              to="/"
              className="flex items-center justify-center gap-2 text-sm text-green-600 font-semibold hover:text-green-700"
            >
              <ArrowLeft size={14} /> Voltar para o início
            </Link>
          </div>
        ) : info ? (
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/20 overflow-hidden">
            {/* Header */}
            <div className="bg-linear-to-br from-green-600 to-emerald-700 px-8 pt-7 pb-8 text-white relative overflow-hidden">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -right-8 -top-8 w-32 h-32 border-4 border-white/10 rounded-full"
              />
              <div className="relative">
                <div className="text-3xl mb-2">🏆</div>
                <h1 className="text-xl font-bold">Convite para o Bolão</h1>
                <p className="text-green-100 text-sm mt-0.5">Copa do Mundo 2026</p>
              </div>
            </div>

            <div className="px-8 py-6 space-y-5">
              {/* Group info */}
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xl font-black shadow-md shadow-green-200">
                    {info.groupName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800 text-base">{info.groupName}</h2>
                    <p className="text-xs text-slate-400">por {info.creatorName}</p>
                  </div>
                </div>
                {info.description && (
                  <p className="text-sm text-slate-500">{info.description}</p>
                )}
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Users size={13} />
                  <span>{info.memberCount} {info.memberCount === 1 ? 'membro' : 'membros'}</span>
                </div>
              </div>

              {/* Already member */}
              {info.isAlreadyMember ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <CheckCircle size={18} />
                    <span className="text-sm font-semibold">Você já faz parte deste grupo!</span>
                  </div>
                  <button
                    onClick={() => navigate(`/meus-grupos/${info.groupId}`)}
                    className="btn-primary"
                  >
                    Ver grupo →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleJoin}
                    disabled={join.isPending}
                    className="btn-primary"
                  >
                    {join.isPending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <LogIn size={18} />
                    )}
                    {join.isPending
                      ? 'Entrando...'
                      : !token
                        ? 'Fazer login para entrar'
                        : 'Entrar no grupo'}
                  </motion.button>

                  {!token && (
                    <p className="text-center text-xs text-slate-400">
                      Você será redirecionado para o login e voltará aqui.
                    </p>
                  )}
                </div>
              )}

              <Link
                to="/"
                className="flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ArrowLeft size={12} /> Voltar para o início
              </Link>
            </div>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
