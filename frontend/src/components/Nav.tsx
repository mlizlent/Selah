import { Heart, HandHeart, MessageCircleHeart, Quote, Megaphone, BookOpen, Sparkles, Menu, X, User, LogOut, Languages } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export type Page = 'home' | 'request' | 'companion' | 'testimonies' | 'whats popping' | 'priestess' | 'bible' | 'my requests' | 'login';

interface NavProps {
  page: Page;
  onNavigate: (p: Page) => void;
  user: { email?: string } | null;
  username: string | null;
  isAdmin: boolean;
  onAccountClick: () => void;
  onSignOut: () => void;
}

const LINKS: { id: Exclude<Page, 'my requests' | 'login'>; labelKey: string; icon: typeof Heart }[] = [
  { id: 'home', labelKey: 'nav.home', icon: Heart },
  { id: 'request', labelKey: 'nav.request', icon: HandHeart },
  { id: 'companion', labelKey: 'nav.companion', icon: MessageCircleHeart },
  { id: 'testimonies', labelKey: 'nav.testimonies', icon: Quote },
  { id: 'whats popping', labelKey: 'nav.whatsPopping', icon: Megaphone },
  { id: 'bible', labelKey: 'nav.bible', icon: BookOpen },
];

export default function Nav({ page, onNavigate, user, username, isAdmin, onAccountClick, onSignOut }: NavProps) {
  const [open, setOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const currentLang = i18n.resolvedLanguage || i18n.language || 'en';
  const toggleLanguage = () => {
    void i18n.changeLanguage(currentLang.startsWith('sw') ? 'en' : 'sw');
  };

  const go = (p: Page) => {
    onNavigate(p);
    setOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <>
      {/* Toggle button - fixed top-left */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed top-4 left-4 z-50 rounded-lg border border-parchment-200 bg-parchment-50/95 p-2.5 text-ink-800 shadow-sm backdrop-blur-sm transition-colors hover:bg-lavender-50 hover:text-lavender-700"
        aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
        aria-expanded={open}
        aria-controls="sidebar-drawer"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Language toggle - fixed top-right */}
      <button
        onClick={toggleLanguage}
        className="fixed top-4 right-4 z-50 inline-flex items-center gap-2 rounded-lg border border-parchment-200 bg-parchment-50/95 px-3 py-2 text-d-label font-medium text-ink-800 shadow-sm backdrop-blur-sm transition-colors hover:bg-lavender-50 hover:text-lavender-700"
        aria-label={currentLang.startsWith('sw') ? t('language.toggleToEn') : t('language.toggleToSw')}
      >
        <Languages className="h-4 w-4" />
        {currentLang.startsWith('sw') ? 'EN' : 'SW'}
      </button>

      {/* Overlay backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink-950/20 backdrop-blur-sm transition-opacity"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar drawer */}
      <aside
        id="sidebar-drawer"
        role="dialog"
        aria-modal={open}
        aria-label={t('nav.ariaLabel')}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-parchment-200 bg-parchment-50 shadow-xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2.5 px-6 py-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lavender-700 text-parchment-50 shadow-sm">
              <Heart className="h-4 w-4" strokeWidth={1.5} />
            </span>
            <span className="font-display text-d-headline font-semibold tracking-wide text-ink-900">{t('common.appName')}</span>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => go(link.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-d-body font-medium transition-all ${
                  page === link.id
                    ? 'bg-lavender-100 text-lavender-700 shadow-[inset_0_-2px_0_0_#c8a2ff]'
                    : 'text-ink-700 hover:bg-lavender-50/70 hover:text-lavender-700'
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lavender-50 text-lavender-600">
                  <link.icon className="h-4 w-4" strokeWidth={1.5} />
                </span>
                {t(link.labelKey)}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => go('priestess')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-d-body font-medium transition-all ${
                  page === 'priestess'
                    ? 'bg-lavender-100 text-lavender-700 shadow-[inset_0_-2px_0_0_#c8a2ff]'
                    : 'text-ink-700 hover:bg-lavender-50/70 hover:text-lavender-700'
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lavender-50 text-lavender-600">
                  <Sparkles className="h-4 w-4" strokeWidth={1.5} />
                </span>
                {t('nav.priestess')}
              </button>
            )}
            {user && (
              <button
                onClick={() => go('my requests')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-d-body font-medium transition-all ${
                  page === 'my requests'
                    ? 'bg-lavender-100 text-lavender-700 shadow-[inset_0_-2px_0_0_#c8a2ff]'
                    : 'text-ink-700 hover:bg-lavender-50/70 hover:text-lavender-700'
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lavender-50 text-lavender-600">
                  <User className="h-4 w-4" strokeWidth={1.5} />
                </span>
                {t('nav.myRequests')}
              </button>
            )}
          </nav>

          <div className="border-t border-parchment-200 p-4">
            <button
              onClick={toggleLanguage}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-parchment-200 bg-parchment-50 px-3 py-2 text-d-label font-medium text-ink-700 transition-colors hover:bg-lavender-50 hover:text-lavender-700"
            >
              <Languages className="h-4 w-4" />
              {currentLang.startsWith('sw') ? t('language.en') : t('language.sw')}
            </button>
            {user ? (
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-d-label text-ink-500">{username || user.email}</p>
                <button
                  onClick={() => {
                    onSignOut();
                    setOpen(false);
                  }}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-d-label font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                  <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {t('nav.signOut')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onAccountClick();
                  setOpen(false);
                }}
                className="btn-primary w-full"
              >
                <User className="h-4 w-4" />
                {t('nav.signIn')}
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
