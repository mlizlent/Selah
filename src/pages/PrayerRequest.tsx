import { useState, useEffect } from 'react';
import {
  Heart,
  Send,
  CheckCircle2,
  Loader2,
  Clock,
  HandHeart,
  AlertCircle,
  CalendarHeart,
  Mail,
} from 'lucide-react';
import { supabase, PRAYER_CATEGORIES } from '@/lib/supabase';
import type { PrayerCategory, PrayerRequest } from '@/lib/supabase';
import { detectCrisis, CRISIS_RESOURCES } from '@/lib/crisis';
import { useAuth } from '@/contexts/AuthContext';

const STATUS_META: Record<string, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-ink-500', bg: 'bg-parchment-100' },
  praying: { label: 'Praying', icon: HandHeart, color: 'text-gold-600', bg: 'bg-gold-500/10' },
  prayed: { label: 'Prayed', icon: CheckCircle2, color: 'text-lavender-600', bg: 'bg-lavender-50' },
};

export default function PrayerRequestPage() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [category, setCategory] = useState<PrayerCategory>('anxiety');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<PrayerRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [trackedRequests, setTrackedRequests] = useState<PrayerRequest[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const [apptName, setApptName] = useState('');
  const [apptContact, setApptContact] = useState('');
  const [apptReason, setApptReason] = useState('');
  const [apptSubmitting, setApptSubmitting] = useState(false);
  const [apptSubmitted, setApptSubmitted] = useState<string | null>(null);
  const [apptError, setApptError] = useState<string | null>(null);

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
      console.error('Prayer request submit error:', error);
      const message = typeof error.message === 'string' ? error.message : 'Something went wrong sending your request. Please try again.';
      setError(message);
      return;
    }

    const newRequest = data as PrayerRequest;
    setSubmitted(newRequest);
    setTrackedRequests((prev) => {
      const updated = [newRequest, ...prev];
      localStorage.setItem('selah-prayer-requests', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (user) {
      setName('');
      setAnonymous(true);
    }
  }, [user]);

  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptName.trim() || !apptContact.trim() || !apptReason.trim()) return;
    setApptSubmitting(true);
    setApptError(null);

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        name: apptName.trim(),
        contact: apptContact.trim(),
        reason: apptReason.trim(),
      })
      .select()
      .single();

    setApptSubmitting(false);
    if (error) {
      console.error('Appointment submit error:', error);
      const message = typeof error.message === 'string' ? error.message : 'Something went wrong. Please try again.';
      setApptError(message);
      return;
    }

    setApptSubmitted(data.id);
    setApptName('');
    setApptContact('');
    setApptReason('');
  };

  useEffect(() => {
    const stored = localStorage.getItem('selah-prayer-requests');
    if (stored) {
      try {
        setTrackedRequests(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (trackedRequests.length === 0) return;
    const interval = setInterval(async () => {
      setLoadingStatus(true);
      const ids = trackedRequests.map((r) => r.id);
      const { data } = await supabase
        .from('prayer_requests')
        .select('*')
        .in('id', ids);
      if (data) {
        const updated = data as PrayerRequest[];
        setTrackedRequests((prev) => {
          const merged = prev.map((r) => updated.find((u) => u.id === r.id) || r);
          localStorage.setItem('selah-prayer-requests', JSON.stringify(merged));
          return merged;
        });
      }
      setLoadingStatus(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [trackedRequests]);

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-6 pt-8 pb-24">
        <div className="card animate-fade-up p-6 text-center sm:p-10">
          <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-lavender-100 text-lavender-600">
            <CheckCircle2 className="h-8 w-8" strokeWidth={1.5} />
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-medium text-ink-800">Your request was received</h2>
          <p className="mt-4 text-ink-500">
            A spiritual leader will pray over what you shared. Your request status will update below.
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

        <div className="mt-12">
          <h3 className="font-display text-lg font-semibold text-ink-800 mb-4">Your Prayer Requests</h3>
          <div className="space-y-4">
            {trackedRequests.map((req) => {
              const meta = STATUS_META[req.status] || STATUS_META.pending;
              return (
                <div key={req.id} className="card p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full ${meta.bg} px-2.5 py-1 text-xs font-medium ${meta.color}`}>
                      <meta.icon className="h-3 w-3" strokeWidth={2} />
                      {meta.label}
                    </span>
                    <span className="rounded-full bg-parchment-100 px-2.5 py-1 text-xs text-ink-600">{req.category}</span>
                    {loadingStatus && <Loader2 className="h-3 w-3 animate-spin text-ink-400" />}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-700">{req.body}</p>
                  {req.prayed_note && (
                    <div className="mt-3 verse-card">
                      <p className="eyebrow text-gold-600">A note for you</p>
                      <p className="mt-1 font-display text-sm italic text-ink-700">"{req.prayed_note}"</p>
                    </div>
                  )}
                  <p className="mt-3 text-xs text-ink-400">
                    {new Date(req.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </p>
                </div>
              );
            })}
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
          pray over it and you will know when she has.
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
            from a real person immediately. Please reach out to one of these services, they are
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

      {apptSubmitted && (
        <div className="mx-auto max-w-2xl px-6 pt-8 pb-24">
          <div className="card animate-fade-up p-6 text-center sm:p-10">
            <span className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-lavender-100 text-lavender-600">
              <CheckCircle2 className="h-8 w-8" strokeWidth={1.5} />
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-medium text-ink-800">Appointment requested</h2>
            <p className="mt-4 text-ink-500">The Priestess will reach out to schedule a time with you.</p>
            <button
              onClick={() => setApptSubmitted(null)}
              className="btn-ghost mt-6"
            >
              Send another request
            </button>
          </div>
        </div>
      )}

      {!apptSubmitted && (
        <div className="mt-16">
          <div className="text-center mb-10">
            <p className="eyebrow mb-3">One-on-one time</p>
            <h2 className="font-display text-3xl font-medium text-ink-800 sm:text-4xl">Book an Appointment</h2>
            <p className="mx-auto mt-3 max-w-xl text-ink-500">Prefer to talk privately? Request a one-on-one time with the Priestess.</p>
          </div>

          <form onSubmit={handleAppointmentSubmit} className="card space-y-7 p-6 sm:p-8">
            <div>
              <label className="mb-2 block text-sm font-medium text-ink-700">Your name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={apptName}
                onChange={(e) => setApptName(e.target.value)}
                placeholder="What should we call you?"
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-ink-700">How can the Priestess reach you? <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  value={apptContact}
                  onChange={(e) => setApptContact(e.target.value)}
                  placeholder="Phone or email"
                  className="input-field pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-ink-700">What would you like to talk about?</label>
              <textarea
                value={apptReason}
                onChange={(e) => setApptReason(e.target.value)}
                rows={4}
                placeholder="Share briefly what you would like to discuss..."
                className="input-field resize-none"
                required
              />
            </div>

            {apptError && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{apptError}</p>
            )}

            <button type="submit" disabled={apptSubmitting || !apptName.trim() || !apptContact.trim() || !apptReason.trim()} className="btn-primary w-full">
              {apptSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <CalendarHeart className="h-4 w-4" />
                  Request appointment
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {trackedRequests.length > 0 && (
        <div className="mt-16">
          <h3 className="font-display text-lg font-semibold text-ink-800 mb-4">Your Prayer Requests</h3>
          <div className="space-y-4">
            {trackedRequests.map((req) => {
              const meta = STATUS_META[req.status] || STATUS_META.pending;
              return (
                <div key={req.id} className="card p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full ${meta.bg} px-2.5 py-1 text-xs font-medium ${meta.color}`}>
                      <meta.icon className="h-3 w-3" strokeWidth={2} />
                      {meta.label}
                    </span>
                    <span className="rounded-full bg-parchment-100 px-2.5 py-1 text-xs text-ink-600">{req.category}</span>
                    {loadingStatus && <Loader2 className="h-3 w-3 animate-spin text-ink-400" />}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-700">{req.body}</p>
                  {req.prayed_note && (
                    <div className="mt-3 verse-card">
                      <p className="eyebrow text-gold-600">A note for you</p>
                      <p className="mt-1 font-display text-sm italic text-ink-700">"{req.prayed_note}"</p>
                    </div>
                  )}
                  <p className="mt-3 text-xs text-ink-400">
                    {new Date(req.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
