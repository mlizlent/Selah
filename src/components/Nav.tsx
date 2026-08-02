import { Heart, HandHeart, MessageCircleHeart, Quote, Megaphone, BookOpen, Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';

export type Page = 'home' | 'request' | 'companion' | 'testimonies' | 'whats popping' | 'priestess' | 'bible';

interface NavProps {
  page: Page;
  onNavigate: (p: Page) => void;
}

const LINKS: { id: Page; label: string; icon: typeof Heart }[] = [
  { id: 'home', label: 'Home', icon: Heart },
  { id: 'request', label: 'Prayer Request', icon: HandHeart },
  { id: 'companion', label: 'Companion', icon: MessageCircleHeart },
  { id: 'testimonies', label: 'Testimonies', icon: Quote },
  { id: 'whats popping', label: "What's popping", icon: Megaphone },
  { id: 'bible', label: 'Bible', icon: BookOpen },
  { id: 'priestess', label: 'Priestess', icon: Sparkles },
];

export default function Nav({ page, onNavigate }: NavProps) {
  const [open, setOpen] = useState(false);

  const go = (p: Page) => {
    onNavigate(p);
    setOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Toggle button - fixed top-left */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed top-4 left-4 z-50 rounded-lg border border-parchment-200 bg-parchment-50/95 p-2.5 text-ink-800 shadow-sm backdrop-blur-sm transition-colors hover:bg-lavender-50 hover:text-lavender-700"
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink-950/20 backdrop-blur-sm transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-parchment-200 bg-parchment-50 shadow-xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2.5 px-6 py-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lavender-700 text-parchment-50 shadow-sm">
              <Heart className="h-4 w-4" strokeWidth={1.5} />
            </span>
            <span className="font-display text-2xl font-semibold tracking-wide text-ink-900">Selah</span>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => go(link.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  page === link.id
                    ? 'bg-lavender-100 text-lavender-700 shadow-[inset_0_-2px_0_0_#c8a2ff]'
                    : 'text-ink-700 hover:bg-lavender-50/70 hover:text-lavender-700'
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lavender-50 text-lavender-600">
                  <link.icon className="h-4 w-4" strokeWidth={1.5} />
                </span>
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
