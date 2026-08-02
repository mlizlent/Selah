import { useState, Suspense, lazy } from 'react';
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
import ErrorBoundary from '@/components/ErrorBoundary';
import { CardSkeleton } from '@/components/Skeletons';

const LazyBible = lazy(() => import('@/pages/Bible'));
const LazyCompanion = lazy(() => import('@/pages/Companion'));
const LazyTestimonies = lazy(() => import('@/pages/Testimonies'));
const LazyPriestess = lazy(() => import('@/pages/Priestess'));
const LazyWhatsPopping = lazy(() => import('@/pages/WhatsPopping'));
const LazyPrayerRequest = lazy(() => import('@/pages/PrayerRequest'));

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

export default function App() {
  const [page, setPage] = useState<Page>('home');

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <Home onNavigate={setPage} />;
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
      default:
        return <Home onNavigate={setPage} />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Nav page={page} onNavigate={setPage} />
      <main className="flex-1">
        <ErrorBoundary fallback={<PageErrorFallback page={page} />}>
          {renderPage()}
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
