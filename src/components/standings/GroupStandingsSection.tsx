import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { groupsApi } from '../../api/groups';
import { queryKeys } from '../../types/api';
import { CopaStandingsTable } from './CopaStandingsTable';

interface GroupStandingsSectionProps {
  groupName: string;
  groupNumber: number;
}

export function GroupStandingsSection({ groupName, groupNumber }: GroupStandingsSectionProps) {
  const { data: standing, isLoading } = useQuery({
    queryKey: queryKeys.standingsGroup(groupName),
    queryFn: () => groupsApi.standings(groupName),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: groupNumber * 0.1 }}
      className="rounded-2xl border border-slate-100 overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="bg-linear-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-4 py-3">
        <h3 className="font-black text-slate-800 text-lg">
          Grupo {groupName}
        </h3>
        {standing && (
          <p className="text-xs text-slate-500 mt-1">
            {standing.teams.length} times · {standing.matches.filter(m => m.status === 3).length} jogos encerrados
          </p>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {standing ? (
          <CopaStandingsTable teams={standing.teams} isLoading={isLoading} />
        ) : isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <p className="text-2xl mb-2">⚽</p>
            <p className="font-medium">Dados não disponíveis</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
