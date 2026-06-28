import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, Loader2, CheckCircle2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { matchesApi } from '../../api/matches';
import { predictionsApi } from '../../api/predictions';
import { bolaoGroupsApi } from '../../api/bolaoGroups';
import { queryKeys, MatchPhase, MatchStatus, type MatchDto, type MatchPhase as MatchPhaseType } from '../../types/api';
import { getImageUrl, isPredictionOpen } from '../../utils/formatters';

type ScoreMap = Record<number, { home: string; away: string }>;

const phaseLabels: Record<MatchPhaseType, string> = {
  [MatchPhase.GroupStage]: 'Fase de Grupos',
  [MatchPhase.RoundOf32]: 'Oitavas de Final',
  [MatchPhase.RoundOf16]: 'Oitavas de Final',
  [MatchPhase.Quarterfinals]: 'Quartas de Final',
  [MatchPhase.Semifinals]: 'Semifinal',
  [MatchPhase.ThirdPlace]: '3º Lugar',
  [MatchPhase.Final]: 'Final',
};

function TeamFlag({ team, size = 'sm' }: { team: MatchDto['homeTeam']; size?: 'sm' | 'md' }) {
  const dim = size === 'md' ? 'w-9 h-6' : 'w-7 h-5';
  const text = size === 'md' ? 'text-[10px]' : 'text-[9px]';
  if (!team) return <div className={`${dim} rounded bg-slate-100`} />;
  const src = getImageUrl(team.flagUrl);
  if (src) return <img src={src} alt={team.name} className={`${dim} object-cover rounded shadow-sm shrink-0`} />;
  return (
    <div className={`${dim} rounded bg-green-100 flex items-center justify-center font-bold text-green-700 shrink-0 ${text}`}>
      {team.fifaCode}
    </div>
  );
}

export function GroupStagePredictionsPage() {
  const { id, phase: phaseParam } = useParams<{ id: string; phase?: string }>();
  const navigate = useNavigate();
  const [scores, setScores] = useState<ScoreMap>({});
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const phase = phaseParam ? parseInt(phaseParam) : MatchPhase.GroupStage;

  const { data: group } = useQuery({
    queryKey: queryKeys.bolaoGroup(id!),
    queryFn: () => bolaoGroupsApi.get(id!),
    staleTime: 60_000,
    enabled: !!id,
  });

  const { data: matches, isLoading } = useQuery({
    queryKey: [
      ...queryKeys.bolaoGroup(id!),
      'phase-matches',
      phase,
    ],
    queryFn: () => matchesApi.byPhase(phase),
    staleTime: 5 * 60_000,
    enabled: !!id,
  });

  const { data: existingPredictions } = useQuery({
    queryKey: queryKeys.predictions(id!),
    queryFn: () => predictionsApi.list(id!),
    staleTime: 60_000,
    enabled: !!id,
  });

  const predictionMap = useMemo(
    () => new Map(existingPredictions?.map((p) => [p.matchId, p]) ?? []),
    [existingPredictions]
  );

  const getScore = (matchId: number) => {
    if (scores[matchId]) return scores[matchId];
    const existing = predictionMap.get(matchId);
    if (existing) return { home: String(existing.homeScore), away: String(existing.awayScore) };
    return { home: '', away: '' };
  };

  const setScore = (matchId: number, field: 'home' | 'away', value: string) => {
    const clean = value.replace(/[^0-9]/g, '').slice(0, 2);
    setScores((prev) => ({
      ...prev,
      [matchId]: { ...getScore(matchId), [field]: clean },
    }));
  };

  const allScheduledMatches = useMemo(
    () => (matches ?? []).filter((m) => m.status === MatchStatus.Scheduled && isPredictionOpen(m.matchDate)),
    [matches]
  );

  const filledMatches = allScheduledMatches.filter((m) => {
    const s = getScore(m.id);
    return s.home !== '' && s.away !== '';
  });

  const handleSave = async () => {
    if (filledMatches.length === 0) {
      toast.error('Preencha ao menos um palpite');
      return;
    }
    setSaving(true);
    setProgress({ done: 0, total: filledMatches.length });

    let success = 0;
    let failed = 0;

    for (const match of filledMatches) {
      const s = getScore(match.id);
      try {
        await predictionsApi.save({
          groupId: id!,
          matchId: match.id,
          homeScore: Number(s.home),
          awayScore: Number(s.away),
        });
        success++;
      } catch {
        failed++;
      }
      setProgress({ done: success + failed, total: filledMatches.length });
    }

    setSaving(false);
    setProgress(null);

    if (failed === 0) {
      toast.success(`${success} palpite${success > 1 ? 's' : ''} salvo${success > 1 ? 's' : ''}!`);
      navigate(`/meus-grupos/${id}?tab=matches`, { replace: true });
    } else {
      toast.error(`${failed} palpite${failed > 1 ? 's' : ''} não ${failed > 1 ? 'foram salvos' : 'foi salvo'}. Tente novamente.`);
    }
  };

  const filled = filledMatches.length;
  const total = allScheduledMatches.length;
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
  const phaseLabel = phaseLabels[phase as MatchPhaseType] || 'Palpites';

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-32 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0"
        >
          <ArrowLeft size={18} className="text-slate-600" />
        </motion.button>
        <div className="flex-1 min-w-0">
          <h1 className="font-black text-slate-800 text-lg leading-tight">Palpites — {phaseLabel}</h1>
          {group && <p className="text-xs text-slate-400 truncate">{group.name}</p>}
        </div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-2"
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">Palpites preenchidos</span>
            <span className={filled === total ? 'text-green-600' : 'text-slate-500'}>
              {filled} / {total}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-linear-to-r from-green-500 to-emerald-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          {filled === total && total > 0 && (
            <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
              <CheckCircle2 size={12} /> Todos os palpites preenchidos!
            </p>
          )}
        </motion.div>
      )}

      {/* Matches */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-14 rounded-2xl" />
          ))}
        </div>
      ) : allScheduledMatches.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50"
        >
          {allScheduledMatches.map((match) => {
            const s = getScore(match.id);
            const isOpen = match.status === MatchStatus.Scheduled && isPredictionOpen(match.matchDate);
            const isFinished = match.status === MatchStatus.Finished;
            const hasExisting = predictionMap.has(match.id);
            const isFilled = s.home !== '' && s.away !== '';

            return (
              <div
                key={match.id}
                className={`px-4 py-3 flex items-center gap-3 ${!isOpen ? 'opacity-60' : ''}`}
              >
                {/* Home team */}
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <TeamFlag team={match.homeTeam} />
                  <span className="text-xs font-semibold text-slate-700 truncate">
                    {match.homeTeam?.name ?? '?'}
                  </span>
                </div>

                {/* Score inputs */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {isOpen ? (
                    <>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={20}
                        value={s.home}
                        onChange={(e) => setScore(match.id, 'home', e.target.value)}
                        placeholder="–"
                        className={`w-9 h-9 text-center rounded-lg text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors ${
                          isFilled
                            ? hasExisting
                              ? 'border-green-300 bg-green-50 text-green-700'
                              : 'border-green-400 bg-green-50 text-green-700'
                            : 'border-slate-200 text-slate-700'
                        }`}
                      />
                      <span className="text-slate-300 font-light text-sm">×</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={20}
                        value={s.away}
                        onChange={(e) => setScore(match.id, 'away', e.target.value)}
                        placeholder="–"
                        className={`w-9 h-9 text-center rounded-lg text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors ${
                          isFilled
                            ? hasExisting
                              ? 'border-green-300 bg-green-50 text-green-700'
                              : 'border-green-400 bg-green-50 text-green-700'
                            : 'border-slate-200 text-slate-700'
                        }`}
                      />
                    </>
                  ) : (
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100">
                      {isFinished ? (
                        <span className="text-sm font-bold text-slate-600 tabular-nums">
                          {match.homeScore} — {match.awayScore}
                        </span>
                      ) : (
                        <Lock size={13} className="text-slate-400" />
                      )}
                    </div>
                  )}
                </div>

                {/* Away team */}
                <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                  <span className="text-xs font-semibold text-slate-700 truncate text-right">
                    {match.awayTeam?.name ?? '?'}
                  </span>
                  <TeamFlag team={match.awayTeam} />
                </div>
              </div>
            );
          })}
        </motion.div>
      ) : (
        <div className="text-center py-12 text-slate-400">
          <p className="text-4xl mb-3">⚽</p>
          <p className="font-semibold text-slate-500">Nenhum jogo disponível</p>
          <p className="text-sm mt-1">Os jogos desta fase aparecerão aqui em breve.</p>
        </div>
      )}

      {/* Floating save bar */}
      <AnimatePresence>
        {filled > 0 && !saving && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-30"
          >
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-green-600 text-white font-bold text-sm shadow-2xl shadow-green-400/40 hover:bg-green-700 active:scale-[0.98] transition-all"
            >
              <Save size={18} />
              Salvar {filled} palpite{filled > 1 ? 's' : ''}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saving overlay */}
      <AnimatePresence>
        {saving && progress && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 w-full max-w-xs text-center space-y-4 shadow-2xl"
            >
              <Loader2 size={36} className="animate-spin text-green-500 mx-auto" />
              <div>
                <p className="font-bold text-slate-800">Salvando palpites...</p>
                <p className="text-sm text-slate-400 mt-1">
                  {progress.done} de {progress.total}
                </p>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-green-500 rounded-full"
                  animate={{ width: `${(progress.done / progress.total) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
