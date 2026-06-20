import { motion } from 'framer-motion';
import { Trophy, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { UserAvatar } from '../ui/UserAvatar';

const TITLES: Record<string, string> = {
  '/': 'Copa do Mundo 2026',
  '/ao-vivo': 'Jogos ao Vivo',
  '/ranking': 'Ranking Geral',
  '/predictions': 'Meus Palpites',
  '/profile': 'Meu Perfil',
  '/admin': 'Painel Admin',
  '/meus-grupos': 'Meus Grupos',
  '/join': 'Convite',
};

export function Header() {
  const user = useAuthStore((s) => s.user);
  const { pathname } = useLocation();

  const title = Object.entries(TITLES).find(([path]) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path)
  )?.[1] ?? 'Bolão Copa 2026';

  return (
    <header className="fixed top-0 inset-x-0 z-40 glass border-b border-white/60">
      {/* Green gradient bar on top */}
      <div className="h-0.5 bg-linear-to-r from-green-500 via-emerald-400 to-green-600" />

      <div className="max-w-2xl mx-auto flex items-center justify-between px-4 h-14">
        {/* Logo + Title */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            transition={{ duration: 0.4 }}
            className="w-8 h-8 rounded-xl bg-linear-to-br from-green-500 to-green-700 flex items-center justify-center shadow-md shadow-green-200"
          >
            <Trophy size={16} className="text-white" />
          </motion.div>
          <div className="flex flex-col leading-tight">
            <motion.span
              key={title}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-bold text-slate-800"
            >
              {title}
            </motion.span>
            <span className="text-[10px] text-green-600 font-semibold tracking-wider uppercase">
              ⚽ FIFA World Cup
            </span>
          </div>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user?.isAdmin && (
            <Link
              to="/admin"
              className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center hover:bg-purple-200 transition-colors"
            >
              <Shield size={15} className="text-purple-600" />
            </Link>
          )}

          {user && (
            <Link to="/profile">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <UserAvatar
                  photoUrl={user.photoUrl}
                  name={user.name}
                  size="sm"
                  className="ring-2 ring-green-400 ring-offset-1"
                />
              </motion.div>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
