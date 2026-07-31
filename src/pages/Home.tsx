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
import type { Page } from '@/components/Nav';

interface HomeProps {
  onNavigate: (p: Page) => void;
}

const HERO_IMG =
  'https://images.pexels.com/photos/34742289/pexels-photo-34742289.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const FEATURES = [
  {
    icon: MessageCircleHeart,
    title: 'A Companion Who Listens',
    desc: 'Tell the companion what is weighing on you. It responds with empathy and gently offers scripture that fits your moment.',
    cta: 'Talk with the Companion',
    page: 'companion' as Page,
  },
  {
    icon: HandHeart,
    title: 'A Real Prayer, From a Real Person',
    desc: 'Submit a prayer request — anonymously if you wish. A spiritual leader receives it and prays over it, and you will know when she has.',
    cta: 'Send a Prayer Request',
    page: 'request' as Page,
  },
  {
    icon: BookOpen,
    title: 'Testimonies of Hope',
    desc: 'Read what happened for others after a prayer was answered. Share your own story when the time is right.',
    cta: 'Read Testimonies',
    page: 'testimonies' as Page,
  },
  {
    icon: BookOpen,
    title: 'Read the Bible (KJV)',
    desc: 'Browse every book and chapter of the King James Version. Search a reference or read straight through.',
    cta: 'Open the Bible',
    page: 'bible' as Page,
  },
];

export default function Home({ onNavigate }: HomeProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={HERO_IMG}
            alt="Misty mountains at sunrise"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-900/40 via-ink-900/30 to-parchment-50/0" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-900/30 to-transparent" />
        </div>

        <div
          className={`relative z-10 mx-auto max-w-3xl px-6 text-center ${
            mounted ? 'animate-fade-up' : 'opacity-0'
          }`}
        >
          <p className="eyebrow mb-6 text-parchment-200/90">A pause for the soul</p>
          <h1 className="font-display text-5xl font-medium leading-[1.1] text-white sm:text-6xl md:text-7xl">
            Bring what you carry.
            <br />
            <span className="italic text-gold-400">Be heard. Be prayed for.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-white/90">
            Selah is a quiet place to lay down your burden — anxiety, grief, stress, conflict — and
            find empathy, scripture, and the care of a real person praying on your behalf.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button onClick={() => onNavigate('companion')} className="btn-primary group">
              <Sparkles className="h-4 w-4" />
              Talk with the Companion
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button onClick={() => onNavigate('request')} className="btn-ghost border-white/30 bg-white/10 text-white hover:bg-white/20">
              <Heart className="h-4 w-4" strokeWidth={1.5} />
              Send a Prayer Request
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="h-10 w-6 rounded-full border-2 border-white/50">
            <div className="mx-auto mt-1.5 h-2 w-1 animate-soft-pulse rounded-full bg-white/70" />
          </div>
        </div>
      </section>

      {/* Intro / Selah meaning */}
      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="eyebrow mb-4">The name</p>
        <h2 className="font-display text-3xl font-medium leading-snug text-ink-800 sm:text-4xl">
          <span className="italic">Selah</span> appears in the Psalms — a breath, a pause, a moment
          to sit with what was just said.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-500">
          We all need that pause. A place to stop, be honest about what hurts, and let something
          steadier hold the weight for a moment. That is what Selah is for.
        </p>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="card group flex flex-col p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-md"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-lavender-100 text-lavender-600 transition-colors group-hover:bg-lavender-600 group-hover:text-parchment-50">
                <f.icon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <h3 className="font-display text-xl font-semibold text-ink-800">{f.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-500">{f.desc}</p>
              <button
                onClick={() => onNavigate(f.page)}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-lavender-600 transition-colors hover:text-lavender-700"
              >
                {f.cta}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Verse banner */}
      <section className="relative overflow-hidden bg-lavender-700 py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 top-0 h-72 w-72 animate-breath rounded-full bg-gold-400 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-72 w-72 animate-breath rounded-full bg-parchment-200 blur-3xl" style={{ animationDelay: '2s' }} />
        </div>
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <Quote className="mx-auto mb-6 h-8 w-8 text-gold-400/80" strokeWidth={1} />
          <p className="font-display text-3xl font-medium italic leading-relaxed text-parchment-50 sm:text-4xl">
            Cast all your anxiety on him, because he cares for you.
          </p>
          <p className="mt-5 text-sm uppercase tracking-wide3 text-parchment-200">1 Peter 5:7</p>
        </div>
      </section>

      {/* Safety note */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <div className="card flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-gold-600">
            <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold text-ink-800">A gentle boundary</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-500">
              The companion is here to listen and point you toward scripture — it is not a
              counselor, a therapist, or a crisis service. If you are in immediate danger, please
              contact emergency services or a crisis line. The companion will always help you find
              those resources.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
