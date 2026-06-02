import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Play, CheckCircle, Loader2, Send, ChevronDown } from 'lucide-react';
import { adminApi } from '../../api/admin';
import { queryKeys, MatchStatus, type MatchDto } from '../../types/api';
import { formatMatchDate } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const STATUS_LABELS: Record<MatchStatus, string> = {
  [MatchStatus.Scheduled]: 'Agendado',
  [MatchStatus.InProgress]: 'Em andamento',
  [MatchStatus.Finished]: 'Finalizado',
  [MatchStatus.Cancelled]: 'Cancelado',
};

export function AdminPage() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<MatchStatus | undefined>(undefined);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [scoreInputs, setScoreInputs] = useState<Record<number, { home: string; away: string }>>({});

  if (!isAdmin) return <Navigate to="/" replace />;

  const { data: matches, isLoading } = useQuery({
    queryKey: ['admin-matches', statusFilter],
    queryFn: () => adminApi.matches(statusFilter),
    staleTime: 30_000,
  });

  const startMatch = useMutation({
    mutationFn: (id: number) => adminApi.startMatch(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-matches'] });
      toast.success('Jogo iniciado!');
    },
    onError: () => toast.error('Erro ao iniciar jogo'),
  });

  const setResult = useMutation({
    mutationFn: ({ id, home, away }: { id: number; home: number; away: number }) =>
      adminApi.setResult(id, { homeScore: home, awayScore: away }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-matches'] });
      toast.success('Resultado salvo!');
    },
    onError: () => toast.error('Erro ao salvar resultado'),
  });

  const genNextPhase = useMutation({
    mutationFn: () => adminApi.generateNextPhase(),
    onSuccess: () => toast.success('Próxima fase gerada!'),
    onError: () => toast.error('Erro ao gerar próxima fase'),
  });

  const sendNotif = useMutation({
    mutationFn: () => adminApi.sendNotification({ title: notifTitle, body: notifBody }),
    onSuccess: () => {
      toast.success('Notificação enviada!');
      setNotifTitle('');
      setNotifBody('');
    },
    onError: () => toast.error('Erro ao enviar notificação'),
  });

  const getScore = (matchId: number) => scoreInputs[matchId] ?? { home: '', away: '' };
  const setScore = (matchId: number, field: 'home' | 'away', value: string) =>
    setScoreInputs((prev) => ({
      ...prev,
      [matchId]: { ...getScore(matchId), [field]: value },
    }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 space-y-6">
      <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
        <ShieldCheck size={22} className="text-purple-600" />
        Painel Admin
      </h1>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => genNextPhase.mutate()}
          disabled={genNextPhase.isPending}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-purple-600 text-white font-medium text-sm hover:bg-purple-700 transition-colors disabled:opacity-60"
        >
          {genNextPhase.isPending ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
          Próxima Fase
        </button>
        <div />
      </div>

      {/* Send notification */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <h2 className="font-semibold text-gray-700 text-sm flex items-center gap-1.5">
          <Send size={16} /> Notificação Manual
        </h2>
        <input
          value={notifTitle}
          onChange={(e) => setNotifTitle(e.target.value)}
          placeholder="Título"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <textarea
          value={notifBody}
          onChange={(e) => setNotifBody(e.target.value)}
          placeholder="Mensagem"
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
        />
        <button
          onClick={() => sendNotif.mutate()}
          disabled={sendNotif.isPending || !notifTitle || !notifBody}
          className="w-full py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-60 transition-colors"
        >
          {sendNotif.isPending ? 'Enviando...' : 'Enviar para todos'}
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
        {([undefined, MatchStatus.Scheduled, MatchStatus.InProgress, MatchStatus.Finished] as (MatchStatus | undefined)[]).map(
          (s) => (
            <button
              key={String(s)}
              onClick={() => setStatusFilter(s)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === undefined ? 'Todos' : STATUS_LABELS[s]}
            </button>
          )
        )}
      </div>

      {/* Matches list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {matches?.map((match) => (
            <AdminMatchCard
              key={match.id}
              match={match}
              score={getScore(match.id)}
              onScoreChange={(field, val) => setScore(match.id, field, val)}
              onStart={() => startMatch.mutate(match.id)}
              onSaveResult={() => {
                const s = getScore(match.id);
                if (s.home === '' || s.away === '') return toast.error('Informe o placar');
                setResult.mutate({ id: match.id, home: Number(s.home), away: Number(s.away) });
              }}
              isStarting={startMatch.isPending}
              isSaving={setResult.isPending}
            />
          ))}
          {matches?.length === 0 && (
            <p className="text-center text-gray-400 py-8">Nenhum jogo encontrado.</p>
          )}
        </div>
      )}
    </div>
  );
}

function AdminMatchCard({
  match,
  score,
  onScoreChange,
  onStart,
  onSaveResult,
  isStarting,
  isSaving,
}: {
  match: MatchDto;
  score: { home: string; away: string };
  onScoreChange: (field: 'home' | 'away', val: string) => void;
  onStart: () => void;
  onSaveResult: () => void;
  isStarting: boolean;
  isSaving: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-medium text-sm text-gray-700">
          {match.homeTeam?.name ?? '?'} × {match.awayTeam?.name ?? '?'}
        </p>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            match.status === MatchStatus.InProgress
              ? 'bg-green-100 text-green-700'
              : match.status === MatchStatus.Finished
                ? 'bg-gray-100 text-gray-600'
                : 'bg-blue-100 text-blue-600'
          }`}
        >
          {STATUS_LABELS[match.status]}
        </span>
      </div>
      <p className="text-xs text-gray-400">{formatMatchDate(match.matchDate)}</p>

      <div className="flex items-center gap-2">
        {match.status === MatchStatus.Scheduled && (
          <button
            onClick={onStart}
            disabled={isStarting}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 transition-colors"
          >
            <Play size={12} /> Iniciar
          </button>
        )}

        <div className="flex items-center gap-1 flex-1">
          <input
            type="number"
            min={0}
            max={20}
            value={score.home}
            onChange={(e) => onScoreChange('home', e.target.value)}
            className="w-10 text-center border border-gray-200 rounded text-sm py-1 focus:outline-none focus:ring-1 focus:ring-purple-400"
            placeholder="0"
          />
          <span className="text-gray-400">×</span>
          <input
            type="number"
            min={0}
            max={20}
            value={score.away}
            onChange={(e) => onScoreChange('away', e.target.value)}
            className="w-10 text-center border border-gray-200 rounded text-sm py-1 focus:outline-none focus:ring-1 focus:ring-purple-400"
            placeholder="0"
          />
          <button
            onClick={onSaveResult}
            disabled={isSaving}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-100 text-purple-700 text-xs font-medium hover:bg-purple-200 transition-colors ml-1"
          >
            {isSaving ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
