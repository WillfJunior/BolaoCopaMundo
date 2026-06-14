import { useQuery } from '@tanstack/react-query';
import { X, AlertCircle, Clock, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { bolaoGroupsApi } from '../../api/bolaoGroups';
import { queryKeys } from '../../types/api';
import { UserAvatar } from '../ui/UserAvatar';
import { formatMatchDate, getImageUrl } from '../../utils/formatters';
import { cn } from '../../utils/cn';

interface MemberPredictionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  memberId: string;
}

export function MemberPredictionsModal({
  isOpen,
  onClose,
  groupId,
  memberId,
}: MemberPredictionsModalProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.memberPredictions(groupId, memberId),
    queryFn: () => bolaoGroupsApi.memberPredictions(groupId, memberId),
    enabled: isOpen && !!groupId && !!memberId,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-auto rounded-t-3xl"
          >
            <div className="bg-white">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-slate-100 px-4 pt-4 pb-3 flex items-center justify-between rounded-t-3xl">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <UserAvatar
                    photoUrl={data?.memberPhotoUrl}
                    name={data?.memberName ?? ''}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {data?.memberName}
                    </p>
                    <p className="text-xs text-slate-400">Palpite para o próximo jogo</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors flex-shrink-0"
                  aria-label="Fechar"
                >
                  <X size={16} className="text-slate-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {isLoading && (
                  <div className="space-y-3">
                    <div className="skeleton h-32 rounded-2xl" />
                    <div className="skeleton h-16 rounded-xl" />
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-800">Erro ao carregar palpites</p>
                      <p className="text-xs text-red-700 mt-1">
                        {error instanceof Error ? error.message : 'Tente novamente mais tarde.'}
                      </p>
                    </div>
                  </div>
                )}

                {data && !isLoading && !error && (
                  <>
                    {!data.canViewPredictions && (
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                        <Clock size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-amber-800">Prazo não encerrado</p>
                          <p className="text-xs text-amber-700 mt-1">
                            Você poderá visualizar este palpite a partir de 1 hora antes do jogo.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Match Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                      {/* Match header */}
                      <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <Clock size={12} />
                            {formatMatchDate(data.prediction.matchDate)}
                          </div>
                          <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
                            Rodada {data.prediction.matchday}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        {/* Teams and scores */}
                        <div className="flex items-center gap-3 mb-4">
                          {/* Home team */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {(() => {
                                const flagUrl = getImageUrl(data.prediction.homeTeam.flagUrl);
                                return flagUrl ? (
                                  <img
                                    src={flagUrl}
                                    alt={data.prediction.homeTeam.name}
                                    className="w-8 h-5 rounded object-cover"
                                  />
                                ) : null;
                              })()}
                              <span className="text-sm font-semibold text-slate-700">
                                {data.prediction.homeTeam.name}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500">
                              Palpite: <span className="font-bold text-slate-700">{data.prediction.predictedHomeScore}</span>
                            </div>
                            {data.prediction.actualHomeScore !== null && (
                              <div className="text-xs text-slate-500 mt-1">
                                Resultado: <span className="font-bold text-slate-700">{data.prediction.actualHomeScore}</span>
                              </div>
                            )}
                          </div>

                          {/* Divider */}
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-xs text-slate-400">x</span>
                            {data.prediction.isProcessed && (
                              <span className={cn(
                                'text-xs font-bold px-2 py-1 rounded',
                                data.prediction.points > 0
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              )}>
                                {data.prediction.points} pts
                              </span>
                            )}
                          </div>

                          {/* Away team */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 justify-end">
                              <span className="text-sm font-semibold text-slate-700">
                                {data.prediction.awayTeam.name}
                              </span>
                              {(() => {
                                const flagUrl = getImageUrl(data.prediction.awayTeam.flagUrl);
                                return flagUrl ? (
                                  <img
                                    src={flagUrl}
                                    alt={data.prediction.awayTeam.name}
                                    className="w-8 h-5 rounded object-cover"
                                  />
                                ) : null;
                              })()}
                            </div>
                            <div className="text-xs text-slate-500 text-right">
                              Palpite: <span className="font-bold text-slate-700">{data.prediction.predictedAwayScore}</span>
                            </div>
                            {data.prediction.actualAwayScore !== null && (
                              <div className="text-xs text-slate-500 mt-1 text-right">
                                Resultado: <span className="font-bold text-slate-700">{data.prediction.actualAwayScore}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Venue */}
                        {data.prediction.venue && (
                          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg mt-3">
                            <MapPin size={12} />
                            <span>{data.prediction.venue}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Safe area spacing */}
              <div className="h-6" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
