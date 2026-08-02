import { useEffect } from 'react';
import { Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle, { type Theme } from '@/components/ThemeToggle';

export type Page = 'home' | 'request' | 'companion' | 'testimonies' | 'priestess' | 'bible';

interface NavProps {
  page: Page;
  onNavigate: (p: Page) => void;
  theme: Theme;
  onToggleTheme: () => void;
}

const LINKS: { id: Page; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'request', label: 'Prayer Request' },
  { id: 'companion', label: 'Companion' },
  { id: 'testimonies', label: 'Testimonies' },
  { id: 'bible', label: 'Bible' },
  { id: 'priestess', label: 'Priestess' },
];

export default function Nav({ page, onNavigate, theme, onToggleTheme }: NavProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (p: Page) => {
    onNavigate(p);
    setOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-parchment-50/95 backdrop-blur-md shadow-[0_8px_30px_rgba(11,17,27,0.12)]'
          : 'bg-[linear-gradient(180deg,rgba(6,10,18,0.7)_0%,rgba(6,10,18,0.25)_70%,rgba(6,10,18,0.0)_100%)] backdrop-blur-[2px]'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <button
          onClick={() => go('home')}
          className="flex items-center gap-2.5 text-ink-900 transition-opacity hover:opacity-70"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lavender-700 text-parchment-50 shadow-sm">
            <Heart className="h-4 w-4" strokeWidth={1.5} />
          </span>
          <span className={`font-display text-2xl font-semibold tracking-wide ${scrolled ? 'text-ink-900' : 'text-white'}`}>
            Selah
          </span>
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => go(link.id)}
              className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                page === link.id
                  ? scrolled
                    ? 'bg-lavender-100 text-lavender-700 shadow-[inset_0_-2px_0_0_#c8a2ff]'
                    : 'bg-white/15 text-gold-100 shadow-[0_0_0_1px_rgba(255,255,255,0.18),0_0_20px_rgba(230,197,117,0.18)]'
                  : scrolled
                    ? 'text-ink-700 hover:text-lavender-700 hover:bg-lavender-50/70'
                    : 'text-white/90 hover:text-gold-200 hover:bg-white/10'
              }`}
            >
              {link.label}
              {page === link.id && (
                <span className="absolute inset-x-4 -bottom-0.5 h-px bg-gold-500" />
              )}
            </button>
          ))}
          <div className="ml-2">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            onClick={() => setOpen((o) => !o)}
            className="rounded-full p-2 text-ink-800 transition-colors hover:bg-lavender-50 hover:text-lavender-700"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-parchment-200 bg-parchment-50/95 backdrop-blur-md md:hidden">
          <div className="flex flex-col px-6 py-3">
            {LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => go(link.id)}
                className={`rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors ${
                  page === link.id ? 'bg-lavender-50 text-lavender-700' : 'text-ink-700 hover:bg-lavender-50/70'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
