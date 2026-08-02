import { useState } from 'react';
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

export default function App() {
  const [page, setPage] = useState<Page>('home');

  return (
    <div className="flex min-h-screen flex-col">
      <Nav page={page} onNavigate={setPage} />
      <main className="flex-1">
        {page === 'home' && <Home onNavigate={setPage} />}
        {page === 'request' && <PrayerRequestPage />}
        {page === 'companion' && <Companion />}
        {page === 'testimonies' && <Testimonies />}
        {page === 'whats popping' && <WhatsPopping />}
        {page === 'bible' && <Bible />}
        {page === 'priestess' && <Priestess />}
      </main>
      <Footer />
    </div>
  );
}
