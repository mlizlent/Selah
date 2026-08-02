import { useState, useEffect } from 'react';
import {
  Heart,
  Send,
  CheckCircle2,
  Loader2,
  Clock,
  HandHeart,
  AlertCircle,
} from 'lucide-react';
import { supabase, PRAYER_CATEGORIES } from '@/lib/supabase';
import type { PrayerCategory, PrayerRequest } from '@/lib/supabase';
import { detectCrisis, CRISIS_RESOURCES } from '@/lib/crisis';
import { useAuth } from '@/contexts/AuthContext';

export default function PrayerRequestPage() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [category, setCategory] = useState<PrayerCategory>('anxiety');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<PrayerRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        user_id: user?.id || null,
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

  useEffect(() => {
    if (user) {
      setName('');
      setAnonymous(true);
    }
  }, [user]);

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-6 pt-8 pb-24">
        <div className="card animate-fade-up p-6 text-center sm:p-10">
          <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-lavender-100 text-lavender-600">
            <CheckCircle2 className="h-8 w-8" strokeWidth={1.5} />
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-medium text-ink-800">Your request was received</h2>
          <p className="mt-4 text-ink-500">
            A spiritual leader will pray over what you shared. You can track its progress from your account.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
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
    <div className="mx-auto max-w-3xl px-6 pt-8 pb-24">
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

      <form onSubmit={handleSubmit} className="card space-y-7 p-6 sm:p-8">
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
    </div>
  );
}
