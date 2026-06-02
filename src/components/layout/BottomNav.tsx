import { Home, Users, Target, User } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { matchesApi } from '../../api/matches';
import { predictionsApi } from '../../api/predictions';
import { MatchStatus, queryKeys } from '../../types/api';
import { useGroupStore } from '../../store/groupStore';
import { cn } from '../../utils/cn';

interface NavItem {
  to: string;
  icon: React.ElementType;
  label: string;
  exact: boolean;
  badgeKey?: 'unpredicted';
}

const NAV_ITEMS: NavItem[] = [
  { to: '/',            icon: Home,   label: 'Copa',    exact: true  },
  { to: '/meus-grupos', icon: Users,  label: 'Grupos',  exact: false },
  { to: '/predictions', icon: Target, label: 'Palpites',exact: false, badgeKey: 'unpredicted' },
  { to: '/profile',     icon: User,   label: 'Perfil',  exact: false },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const activeGroupId = useGroupStore((s) => s.activeGroupId);

  const { data: upcoming } = useQuery({
    queryKey: queryKeys.upcoming(48),
    queryFn: () => matchesApi.upcoming(48),
    staleTime: 60_000,
  });

  const { data: predictions } = useQuery({
    queryKey: queryKeys.predictions(activeGroupId ?? ''),
    queryFn: () => predictionsApi.list(activeGroupId!),
    staleTime: 5 * 60_000,
    enabled: !!activeGroupId,
  });

  const predictedIds = new Set(predictions?.map((p) => p.matchId) ?? []);
  const unpredicted =
    upcoming?.filter(
      (m) => m.status === MatchStatus.Scheduled && !predictedIds.has(m.id)
    ).length ?? 0;

  const hasLive = upcoming?.some((m) => m.status === MatchStatus.InProgress) ?? false;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] pb-safe">
      <div className="max-w-2xl mx-auto flex items-stretch h-16">
        {NAV_ITEMS.map(({ to, icon: Icon, label, exact, badgeKey }) => {
          const badge = badgeKey === 'unpredicted' ? unpredicted : 0;

          return (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className="flex-1 flex flex-col items-center justify-center relative select-none"
            >
              {({ isActive }) => (
                <>
                  {/* Active pill */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-x-2 top-1.5 h-10 rounded-xl bg-green-50 border border-green-100"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                  </AnimatePresence>

                  <div className="relative z-10 flex flex-col items-center gap-0.5">
                    <motion.div
                      animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="relative"
                    >
                      <Icon
                        size={20}
                        className={cn(
                          'transition-colors duration-200',
                          isActive ? 'text-green-600' : 'text-slate-400'
                        )}
                      />

                      {/* Live dot on Copa tab */}
                      {to === '/' && hasLive && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                        </span>
                      )}

                      {/* Unpredicted badge on Palpites tab */}
                      {badge > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1.5 min-w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1 shadow-sm"
                        >
                          {badge > 9 ? '9+' : badge}
                        </motion.span>
                      )}
                    </motion.div>

                    <span
                      className={cn(
                        'text-[10px] font-medium transition-colors duration-200',
                        isActive ? 'text-green-600' : 'text-slate-400'
                      )}
                    >
                      {label}
                    </span>
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
