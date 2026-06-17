import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { groupsApi } from '../../api/groups';
import { queryKeys } from '../../types/api';
import { GroupStandingsSection } from '../../components/standings/GroupStandingsSection';

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export function CopaStandingsPage() {
  const { data: allStandings, isLoading } = useQuery({
    queryKey: queryKeys.standingsAll,
    queryFn: groupsApi.standingsAll,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-6"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-slate-800">⚽ Classificação da Copa</h1>
          <p className="text-sm text-slate-500 mt-2">
            Acompanhe a posição de todos os times em seus grupos
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3">
          {allStandings && (
            <>
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-center">
                <p className="text-xs text-blue-600 font-semibold">Total de Times</p>
                <p className="text-2xl font-black text-blue-700 mt-1">
                  {allStandings.reduce((sum, g) => sum + g.teams.length, 0)}
                </p>
              </div>
              <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-center">
                <p className="text-xs text-green-600 font-semibold">Grupos</p>
                <p className="text-2xl font-black text-green-700 mt-1">
                  {allStandings.length}
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Groups */}
      <div className="px-4 space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-80 rounded-2xl" />
          ))
        ) : allStandings ? (
          allStandings.map((standing, i) => (
            <GroupStandingsSection
              key={standing.groupName}
              groupName={standing.groupName}
              groupNumber={i}
            />
          ))
        ) : (
          <div className="text-center py-16 text-slate-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-medium">Nenhum dado disponível</p>
          </div>
        )}
      </div>
    </div>
  );
}
