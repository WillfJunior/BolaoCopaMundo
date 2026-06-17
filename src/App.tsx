import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { PrivateRoute } from './components/layout/PrivateRoute';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { PageTransition } from './components/layout/PageTransition';
import { PWAInstallModal } from './components/ui/PWAInstallModal';
import { useAuthStore } from './store/authStore';
import { initAxiosAuth } from './api/axios';
import { useRankingHub } from './hooks/useRankingHub';

// Eager — auth pages (small, needed on first load)
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Lazy — route-based code splitting
const GroupListPage = lazy(() =>
  import('./pages/groups/GroupListPage').then((m) => ({ default: m.GroupListPage }))
);
const GroupDetailPage = lazy(() =>
  import('./pages/groups/GroupDetailPage').then((m) => ({ default: m.GroupDetailPage }))
);
const MatchDetailPage = lazy(() =>
  import('./pages/matches/MatchDetailPage').then((m) => ({ default: m.MatchDetailPage }))
);
const MyPredictionsPage = lazy(() =>
  import('./pages/predictions/MyPredictionsPage').then((m) => ({ default: m.MyPredictionsPage }))
);
const ProfilePage = lazy(() =>
  import('./pages/profile/ProfilePage').then((m) => ({ default: m.ProfilePage }))
);
const AdminPage = lazy(() =>
  import('./pages/admin/AdminPage').then((m) => ({ default: m.AdminPage }))
);
const MyBolaoGroupsPage = lazy(() =>
  import('./pages/bolaoGroups/MyBolaoGroupsPage').then((m) => ({ default: m.MyBolaoGroupsPage }))
);
const BolaoGroupDetailPage = lazy(() =>
  import('./pages/bolaoGroups/BolaoGroupDetailPage').then((m) => ({
    default: m.BolaoGroupDetailPage,
  }))
);
const JoinGroupPage = lazy(() =>
  import('./pages/bolaoGroups/JoinGroupPage').then((m) => ({ default: m.JoinGroupPage }))
);
const GroupStagePredictionsPage = lazy(() =>
  import('./pages/bolaoGroups/GroupStagePredictionsPage').then((m) => ({ default: m.GroupStagePredictionsPage }))
);
const CopaStandingsPage = lazy(() =>
  import('./pages/standings/CopaStandingsPage').then((m) => ({ default: m.CopaStandingsPage }))
);
const DashboardPage = lazy(() =>
  import('./pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);

initAxiosAuth(
  () => useAuthStore.getState().token,
  () => useAuthStore.getState().logout()
);

function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-3">
      <div className="w-10 h-10 border-[3px] border-green-200 border-t-green-600 rounded-full animate-spin" />
      <span className="text-sm text-slate-400 font-medium">Carregando...</span>
    </div>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}

function AppLayout() {
  const location = useLocation();
  useRankingHub();

  return (
    <div className="flex flex-col min-h-dvh">
      <Header />
      <main className="flex-1 bg-slate-50/80">
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<Wrap><DashboardPage /></Wrap>} />
                <Route path="/groups/:name" element={<Wrap><GroupDetailPage /></Wrap>} />
                <Route path="/matches/:id" element={<Wrap><MatchDetailPage /></Wrap>} />
                <Route path="/predictions" element={<Wrap><MyPredictionsPage /></Wrap>} />
                <Route path="/standings" element={<Wrap><CopaStandingsPage /></Wrap>} />
                {/* Ranking is per bolão group — redirect legacy URL */}
                <Route path="/ranking" element={<Navigate to="/meus-grupos" replace />} />
                <Route path="/profile" element={<Wrap><ProfilePage /></Wrap>} />
                <Route path="/admin" element={<Wrap><AdminPage /></Wrap>} />
                <Route path="/meus-grupos" element={<Wrap><MyBolaoGroupsPage /></Wrap>} />
                <Route path="/meus-grupos/:id" element={<Wrap><BolaoGroupDetailPage /></Wrap>} />
                <Route path="/meus-grupos/:id/palpites" element={<Wrap><GroupStagePredictionsPage /></Wrap>} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>
      <BottomNav />
    </div>
  );
}

export function App() {
  return (
    <>
      <PWAInstallModal />
      <Toaster
        position="top-center"
        containerStyle={{ top: 64 }}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '14px',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
            padding: '12px 16px',
          },
          success: {
            style: { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' },
            iconTheme: { primary: '#16a34a', secondary: '#f0fdf4' },
          },
          error: {
            style: { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
            iconTheme: { primary: '#dc2626', secondary: '#fef2f2' },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        {/* Join via invite link — accessible before auth (redirect inside) */}
        <Route
          path="/join/:code"
          element={
            <Suspense fallback={<PageLoader />}>
              <JoinGroupPage />
            </Suspense>
          }
        />
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </>
  );
}
