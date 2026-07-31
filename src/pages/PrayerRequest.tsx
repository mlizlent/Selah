import { useState } from 'react';
import {
  Heart,
  Send,
  CheckCircle2,
  Loader2,
  Search,
  Clock,
  HandHeart,
  AlertCircle,
} from 'lucide-react';
import { supabase, PRAYER_CATEGORIES } from '@/lib/supabase';
import type { PrayerCategory, PrayerRequest } from '@/lib/supabase';
import { detectCrisis, CRISIS_RESOURCES } from '@/lib/crisis';

export default function PrayerRequestPage() {
  const [name, setName] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [category, setCategory] = useState<PrayerCategory>('anxiety');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<PrayerRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  // status checker
  const [lookupId, setLookupId] = useState('');
  const [found, setFound] = useState<PrayerRequest | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const crisis = body.length > 8 ? detectCrisis(body) : { isCrisis: false };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setError(null);

    const { data, error } = await supabase
      .from('prayer_requests')
      .insert({
        name: anonymous ? null : name.trim() || null,
        category,
        body: body.trim(),
      })
      .select()
      .single();

    setSubmitting(false);
    if (error) {
      setError('Something went wrong sending your request. Please try again.');
      return;
    }
    setSubmitted(data as PrayerRequest);
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupId.trim()) return;
    setSearching(true);
    setSearchError(null);
    setFound(null);

    const { data, error } = await supabase
      .from('prayer_requests')
      .select('*')
      .eq('id', lookupId.trim())
      .maybeSingle();

    setSearching(false);
    if (error) {
      setSearchError('Could not look up that request.');
      return;
    }
    if (!data) {
      setSearchError('No request found with that reference. Check the code and try again.');
      return;
    }
    setFound(data as PrayerRequest);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-6 pt-32 pb-24">
        <div className="card animate-fade-up p-10 text-center">
          <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-lavender-100 text-lavender-600">
            <CheckCircle2 className="h-8 w-8" strokeWidth={1.5} />
          </span>
          <h2 className="font-display text-3xl font-medium text-ink-800">Your request was received</h2>
          <p className="mt-4 text-ink-500">
            A spiritual leader will pray over what you shared. You can check back any time with the
            reference below to see when your request has been prayed for.
          </p>
          <div className="mt-8 rounded-xl border border-dashed border-lavender-300 bg-lavender-50 px-6 py-5">
            <p className="eyebrow text-lavender-600">Your private reference</p>
            <p className="mt-1 font-mono text-lg text-ink-800 select-all">{submitted.id}</p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => {
                setLookupId(submitted.id);
                setSubmitted(null);
              }}
              className="btn-primary"
            >
              <Search className="h-4 w-4" />
              Check its status
            </button>
            <button
              onClick={() => {
                setSubmitted(null);
                setBody('');
                setName('');
              }}
              className="btn-ghost"
            >
              Send another request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 pt-32 pb-24">
      <div className="mb-12 text-center">
        <p className="eyebrow mb-3">Lay it down</p>
        <h1 className="font-display text-4xl font-medium text-ink-800 sm:text-5xl">
          Send a Prayer Request
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-ink-500">
          Share what is on your heart. You can stay anonymous. A real person will receive this and
          pray over it — and you will know when she has.
        </p>
      </div>

      {crisis.isCrisis && (
        <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold">Please read this first</h3>
          </div>
          <p className="mt-2 text-sm text-red-700">
            It sounds like you are carrying something very heavy right now. You deserve support
            from a real person immediately. Please reach out to one of these services — they are
            free, confidential, and available 24/7.
          </p>
          <ul className="mt-4 space-y-2">
            {CRISIS_RESOURCES.map((r) => (
              <li key={r.name} className="text-sm text-red-700">
                <span className="font-medium">{r.name}:</span> {r.contact} —{' '}
                <a href={r.url} target="_blank" rel="noreferrer" className="underline">
                  {r.url}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-red-700">
            You are still welcome to send your prayer request below — but please reach out to one of
            these services too.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-7 p-8">
        {/* anonymity toggle */}
        <div>
          <label className="mb-3 block text-sm font-medium text-ink-700">How would you like to sign it?</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAnonymous(true)}
              className={`rounded-xl border p-4 text-left transition-all ${
                anonymous
                  ? 'border-lavender-500 bg-lavender-50 ring-2 ring-lavender-300/40'
                  : 'border-parchment-200 bg-parchment-50 hover:border-lavender-300'
              }`}
            >
              <p className="text-sm font-medium text-ink-800">Anonymous</p>
              <p className="mt-0.5 text-xs text-ink-500">No name attached</p>
            </button>
            <button
              type="button"
              onClick={() => setAnonymous(false)}
              className={`rounded-xl border p-4 text-left transition-all ${
                !anonymous
                  ? 'border-lavender-500 bg-lavender-50 ring-2 ring-lavender-300/40'
                  : 'border-parchment-200 bg-parchment-50 hover:border-lavender-300'
              }`}
            >
              <p className="text-sm font-medium text-ink-800">With my name</p>
              <p className="mt-0.5 text-xs text-ink-500">So she can pray by name</p>
            </button>
          </div>
        </div>

        {!anonymous && (
          <div className="animate-fade-in">
            <label className="mb-2 block text-sm font-medium text-ink-700">Your name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should we call you?"
              className="input-field"
            />
          </div>
        )}

        {/* category */}
        <div>
          <label className="mb-3 block text-sm font-medium text-ink-700">What is it about?</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRAYER_CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`rounded-xl border p-3 text-center transition-all ${
                  category === cat.value
                    ? 'border-lavender-500 bg-lavender-50 ring-2 ring-lavender-300/40'
                    : 'border-parchment-200 bg-parchment-50 hover:border-lavender-300'
                }`}
              >
                <p className="text-xs font-medium text-ink-800">{cat.label}</p>
                <p className="mt-0.5 text-[11px] text-ink-400">{cat.blurb}</p>
              </button>
            ))}
          </div>
        </div>

        {/* body */}
        <div>
          <label className="mb-2 block text-sm font-medium text-ink-700">Your request</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            placeholder="Share as much or as little as you like. This is between you and God."
            className="input-field resize-none"
          />
          <p className="mt-2 text-xs text-ink-400">{body.length} characters</p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <button type="submit" disabled={submitting || !body.trim()} className="btn-primary w-full">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send my request
            </>
          )}
        </button>
      </form>

      {/* Status checker */}
      <div className="mt-16">
        <div className="mb-6 flex items-center gap-2">
          <Search className="h-5 w-5 text-lavender-600" />
          <h2 className="font-display text-2xl font-medium text-ink-800">Already sent one? Check its status</h2>
        </div>
        <form onSubmit={handleLookup} className="card flex flex-col gap-3 p-6 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-ink-700">Your reference code</label>
            <input
              type="text"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              placeholder="Paste the code you received"
              className="input-field font-mono text-sm"
            />
          </div>
          <button type="submit" disabled={searching || !lookupId.trim()} className="btn-ghost shrink-0">
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Check status
          </button>
        </form>

        {searchError && (
          <p className="mt-3 rounded-lg bg-parchment-100 px-4 py-3 text-sm text-ink-600">{searchError}</p>
        )}

        {found && <StatusCard req={found} />}
      </div>
    </div>
  );
}

function StatusCard({ req }: { req: PrayerRequest }) {
  const statusConfig = {
    pending: {
      icon: Clock,
      label: 'Received',
      color: 'text-ink-500',
      bg: 'bg-parchment-100',
      desc: 'Your request has been received and is waiting in the queue. A spiritual leader will pray over it soon.',
    },
    praying: {
      icon: HandHeart,
      label: 'Being prayed over',
      color: 'text-gold-600',
      bg: 'bg-gold-500/10',
      desc: 'A spiritual leader has your request in her hands right now and is praying over it.',
    },
    prayed: {
      icon: CheckCircle2,
      label: 'Prayed for',
      color: 'text-lavender-600',
      bg: 'bg-lavender-50',
      desc: 'Your request has been prayed for. May you feel held.',
    },
  }[req.status];

  return (
    <div className="card mt-4 animate-fade-up p-6">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
          <statusConfig.icon className="h-5 w-5" strokeWidth={1.5} />
        </span>
        <div>
          <p className="text-xs uppercase tracking-wide2 text-ink-400">Status</p>
          <p className={`font-display text-lg font-semibold ${statusConfig.color}`}>{statusConfig.label}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-ink-500">{statusConfig.desc}</p>
      {req.prayed_note && (
        <div className="mt-4 verse-card">
          <p className="eyebrow text-gold-600">A note for you</p>
          <p className="mt-1 font-display text-base italic text-ink-700">"{req.prayed_note}"</p>
        </div>
      )}
      <div className="mt-4 border-t border-parchment-200 pt-3 text-xs text-ink-400">
        Submitted {new Date(req.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
        {req.prayed_at && ` · Prayed for ${new Date(req.prayed_at).toLocaleDateString(undefined, { dateStyle: 'long' })}`}
      </div>
    </div>
  );
}
