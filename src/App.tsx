import { useState } from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import type { Page } from '@/components/Nav';
import Home from '@/pages/Home';
import PrayerRequestPage from '@/pages/PrayerRequest';
import Companion from '@/pages/Companion';
import Testimonies from '@/pages/Testimonies';
import Priestess from '@/pages/Priestess';
import Bible from '@/pages/Bible';
import { useTheme } from '@/components/ThemeToggle';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const { theme, toggle } = useTheme();

  return (
    <div className="flex min-h-screen flex-col">
      <Nav page={page} onNavigate={setPage} theme={theme} onToggleTheme={toggle} />
      <main className="flex-1">
        {page === 'home' && <Home onNavigate={setPage} />}
        {page === 'request' && <PrayerRequestPage />}
        {page === 'companion' && <Companion />}
        {page === 'testimonies' && <Testimonies />}
        {page === 'bible' && <Bible />}
        {page === 'priestess' && <Priestess />}
      </main>
      <Footer />
    </div>
  );
}
