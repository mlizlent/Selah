import { useState, useEffect } from 'react';
import {
  Heart,
  MessageCircleHeart,
  BookOpen,
  Sparkles,
  HandHeart,
  ArrowRight,
  Quote,
  ShieldCheck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Page } from '@/components/Nav';

interface HomeProps {
  onNavigate: (p: Page) => void;
}

const HERO_IMG =
  'https://cdn.tuko.co.ke/images/1200x675/0fgjhs6nr7e7ua565.jpeg?v=1';

const FEATURES = [
  { icon: MessageCircleHeart, key: 'companion', page: 'companion' as Page },
  { icon: HandHeart, key: 'prayer', page: 'request' as Page },
  { icon: BookOpen, key: 'testimonies', page: 'testimonies' as Page },
  { icon: BookOpen, key: 'bible', page: 'bible' as Page },
];

export default function Home({ onNavigate }: HomeProps) {
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();
  useEffect(() => setMounted(true), []);

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[75vh] items-center justify-center overflow-hidden bg-ink-950">
        <div className="absolute inset-0">
          <img
            src={HERO_IMG}
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(230,197,117,0.22),_transparent_34%),linear-gradient(120deg,rgba(6,10,18,0.92)_0%,rgba(6,10,18,0.82)_45%,rgba(6,10,18,0.68)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />
        </div>

        <div
          className={`relative z-10 mx-auto max-w-4xl px-6 py-24 text-center ${
            mounted ? 'animate-fade-up' : 'opacity-0'
          }`}
        >
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-d-body font-semibold uppercase tracking-[0.28em] text-white shadow-[0_0_35px_rgba(255,255,255,0.12)] backdrop-blur-md">
              <BookOpen className="h-4 w-4" />
              {t('home.badge')}
            </div>
          </div>
          <h1 className="font-display text-d-display font-medium leading-[1.05] text-white sm:text-d-display md:text-7xl">
            {t('home.titleLine1')}
            <br />
            <span className="italic text-gold-400">{t('home.titleLine2')}</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-d-title leading-relaxed text-white/90">
            {t('home.subtitle')}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button onClick={() => onNavigate('companion')} className="btn-primary group">
              <Sparkles className="h-4 w-4" />
              {t('home.talkCta')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button onClick={() => onNavigate('request')} className="btn-ghost border-white/30 bg-white/10 text-white hover:bg-white/20">
              <Heart className="h-4 w-4" strokeWidth={1.5} />
              {t('home.requestCta')}
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="h-10 w-6 rounded-full border-2 border-white/50">
            <div className="mx-auto mt-1.5 h-2 w-1 animate-soft-pulse rounded-full bg-white/70" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.key}
              className="card group flex flex-col p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-md"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-lavender-100 text-lavender-600 transition-colors group-hover:bg-lavender-600 group-hover:text-parchment-50">
                <f.icon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <h3 className="font-display text-d-title font-semibold text-ink-800">{t(`home.features.${f.key}.title`)}</h3>
              <p className="mt-3 flex-1 text-d-body leading-relaxed text-ink-500">{t(`home.features.${f.key}.desc`)}</p>
              <button
                onClick={() => onNavigate(f.page)}
                className="mt-6 inline-flex items-center gap-1.5 text-d-body font-medium text-lavender-600 transition-colors hover:text-lavender-700"
              >
                {t(`home.features.${f.key}.cta`)}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Verse banner */}
      <section className="relative overflow-hidden py-24" style={{ backgroundColor: '#7D5F99' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 top-0 h-72 w-72 animate-breath rounded-full bg-gold-400 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-72 w-72 animate-breath rounded-full bg-parchment-200 blur-3xl" style={{ animationDelay: '2s' }} />
        </div>
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <Quote className="mx-auto mb-6 h-8 w-8 text-gold-400/80" strokeWidth={1} />
          <p className="font-display text-d-headline font-medium italic leading-relaxed text-parchment-50 sm:text-d-headline">
            {t('home.verseText')}
          </p>
          <p className="mt-5 text-d-body uppercase tracking-wide3 text-parchment-200">{t('home.verseRef')}</p>
        </div>
      </section>

      {/* Safety note */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <div className="card flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-gold-600">
            <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
          </span>
          <div>
            <h3 className="font-display text-d-title font-semibold text-ink-800">{t('home.boundaryTitle')}</h3>
            <p className="mt-1 text-d-body leading-relaxed text-ink-500">
              {t('home.boundaryBody')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
