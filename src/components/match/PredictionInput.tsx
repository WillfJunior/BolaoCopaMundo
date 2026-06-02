import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { predictionsApi } from '../../api/predictions';
import { type MatchDto, MatchStatus, type PredictionDto, queryKeys } from '../../types/api';
import { toast } from 'react-hot-toast';
import { Lock, Save, CheckCircle2 } from 'lucide-react';
import { ScoreBadge } from './ScoreBadge';

interface Props {
  match: MatchDto;
  prediction: PredictionDto | null;
}

export function PredictionInput({ match, prediction }: Props) {
  const qc = useQueryClient();
  const isOpen =
    match.status === MatchStatus.Scheduled && new Date(match.matchDate) > new Date();

  const [home, setHome] = useState(prediction?.homeScore != null ? String(prediction.homeScore) : '');
  const [away, setAway] = useState(prediction?.awayScore != null ? String(prediction.awayScore) : '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (prediction) {
      setHome(String(prediction.homeScore));
      setAway(String(prediction.awayScore));
    }
  }, [prediction]);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      predictionsApi.save({
        matchId: match.id,
        homeScore: Number(home),
        awayScore: Number(away),
      }),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.predictionForMatch(match.id), data);
      qc.invalidateQueries({ queryKey: queryKeys.predictions });
      toast.success('Palpite salvo!');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
    onError: () => toast.error('Erro ao salvar palpite'),
  });

  const handleSave = useCallback(() => {
    if (home === '' || away === '') return toast.error('Preencha o placar completo');
    mutate();
  }, [home, away, mutate]);

  /* Closed — locked state */
  if (!isOpen) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-slate-50 border border-slate-200 p-4"
      >
        <div className="flex items-center gap-2 text-slate-500 text-sm mb-3">
          <Lock size={15} />
          <span className="font-medium">Prazo encerrado</span>
        </div>
        {prediction ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Seu palpite</p>
              <p className="text-2xl font-bold text-slate-700 tabular-nums">
                {prediction.homeScore} — {prediction.awayScore}
              </p>
            </div>
            <ScoreBadge points={prediction.points} isProcessed={prediction.isProcessed} />
          </div>
        ) : (
          <p className="text-sm text-slate-400">Você não fez palpite neste jogo.</p>
        )}
      </motion.div>
    );
  }

  /* Open — input state */
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-green-200 bg-green-50/60 p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-green-800">🎯 Seu palpite</p>
        {prediction && (
          <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
            Editando
          </span>
        )}
      </div>

      {/* Score inputs */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs font-medium text-slate-500 text-center max-w-20 leading-tight truncate">
            {match.homeTeam?.name ?? 'Casa'}
          </span>
          <input
            type="number"
            min={0}
            max={20}
            value={home}
            onChange={(e) => { setHome(e.target.value); setSaved(false); }}
            className="score-input"
            placeholder="0"
          />
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl font-extralight text-slate-300 mt-5">×</span>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs font-medium text-slate-500 text-center max-w-20 leading-tight truncate">
            {match.awayTeam?.name ?? 'Visitante'}
          </span>
          <input
            type="number"
            min={0}
            max={20}
            value={away}
            onChange={(e) => { setAway(e.target.value); setSaved(false); }}
            className="score-input"
            placeholder="0"
          />
        </div>
      </div>

      {/* Save button */}
      <motion.button
        onClick={handleSave}
        disabled={isPending}
        whileTap={{ scale: 0.97 }}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
        style={{
          background: saved
            ? 'linear-gradient(135deg, #22c55e, #16a34a)'
            : 'linear-gradient(135deg, #16a34a, #15803d)',
          color: 'white',
          boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
        }}
      >
        <AnimatePresence mode="wait">
          {saved ? (
            <motion.span
              key="saved"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex items-center gap-2"
            >
              <CheckCircle2 size={17} />
              Palpite salvo!
            </motion.span>
          ) : isPending ? (
            <motion.span key="loading" className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Salvando...
            </motion.span>
          ) : (
            <motion.span key="idle" className="flex items-center gap-2">
              <Save size={16} />
              {prediction ? 'Atualizar palpite' : 'Salvar palpite'}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
}
