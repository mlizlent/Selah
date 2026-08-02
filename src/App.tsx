import { useState, useEffect, Suspense, lazy } from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import type { Page } from '@/components/Nav';
import Home from '@/pages/Home';
import PrayerRequestPage from '@/pages/PrayerRequest';
import Companion from '@/pages/Companion';
import Testimonies from '@/pages/Testimonies';
import WhatsPopping from '@/pages/WhatsPopping';
import Priestess from '@/pages/Priestess';
import Bible from '@/pages/Bible';
import Login from '@/pages/Login';
import ErrorBoundary from '@/components/ErrorBoundary';
import { CardSkeleton } from '@/components/Skeletons';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import AccountModal from '@/components/AccountModal';

const LazyBible = lazy(() => import('@/pages/Bible'));
const LazyCompanion = lazy(() => import('@/pages/Companion'));
const LazyTestimonies = lazy(() => import('@/pages/Testimonies'));
const LazyPriestess = lazy(() => import('@/pages/Priestess'));
const LazyWhatsPopping = lazy(() => import('@/pages/WhatsPopping'));
const LazyPrayerRequest = lazy(() => import('@/pages/PrayerRequest'));
const LazyMyRequests = lazy(() => import('@/pages/MyRequests'));

const PageErrorFallback = ({ page }: { page: string }) => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
      <span className="text-2xl">⚠️</span>
    </span>
    <h2 className="font-display text-xl font-semibold text-ink-800">Something went wrong</h2>
    <p className="max-w-sm text-sm text-ink-500">
      We hit an unexpected error loading {page}. Please try again.
    </p>
    <button
      onClick={() => window.location.reload()}
      className="btn-primary"
    >
      Refresh page
    </button>
  </div>
);

type ExtendedPage = Page | 'my requests' | 'login';

function AppContent() {
  const [page, setPage] = useState<ExtendedPage>('home');
  const [showAccount, setShowAccount] = useState(false);
  const { user, loading, isAdmin, signOut } = useAuth();

  useEffect(() => {
    if (!loading && page !== 'home' && page !== 'login' && !user) {
      setShowAccount(true);
    }
    if (!loading && page === 'priestess' && !isAdmin) {
      setPage('home');
    }
    if (!loading && page === 'login' && user) {
      if (isAdmin) {
        setPage('priestess');
      } else {
        setPage('home');
      }
    }
  }, [user, loading, isAdmin, page]);

  const navigateTo = (p: ExtendedPage) => {
    if (p === 'home') {
      setPage(p);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (loading) return;
    if (user) {
      if (p === 'priestess' && !isAdmin) {
        setPage('home');
        return;
      }
      setPage(p);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShowAccount(true);
    }
  };

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <Home onNavigate={navigateTo} />;
      case 'request':
        return (
          <Suspense fallback={<div className="py-12"><CardSkeleton /></div>}>
            <LazyPrayerRequest />
          </Suspense>
        );
      case 'companion':
        return (
          <Suspense fallback={<div className="py-12"><CardSkeleton /></div>}>
            <LazyCompanion />
          </Suspense>
        );
      case 'testimonies':
        return (
          <Suspense fallback={<div className="py-12"><CardSkeleton /></div>}>
            <LazyTestimonies />
          </Suspense>
        );
      case 'whats popping':
        return (
          <Suspense fallback={<div className="py-12"><CardSkeleton /></div>}>
            <LazyWhatsPopping />
          </Suspense>
        );
      case 'bible':
        return (
          <Suspense fallback={<div className="py-12"><CardSkeleton /></div>}>
            <LazyBible />
          </Suspense>
        );
      case 'priestess':
        return (
          <Suspense fallback={<div className="py-12"><CardSkeleton /></div>}>
            <LazyPriestess />
          </Suspense>
        );
      case 'my requests':
        return (
          <Suspense fallback={<div className="py-12"><CardSkeleton /></div>}>
            <LazyMyRequests />
          </Suspense>
        );
      case 'login':
        return <Login />;
      default:
        return <Home onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Nav page={page} onNavigate={navigateTo} user={user} isAdmin={isAdmin} onAccountClick={() => setShowAccount(true)} onSignOut={signOut} />
      <main className="flex-1">
        <ErrorBoundary fallback={<PageErrorFallback page={page} />}>
          {renderPage()}
        </ErrorBoundary>
      </main>
      <Footer />
      <AccountModal open={showAccount} onClose={() => setShowAccount(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
