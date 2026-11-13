import { useState, useEffect } from 'react';
import {
  Quote,
  Plus,
  Loader2,
  CheckCircle2,
  Send,
  Sparkles,
  Heart,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { Testimony } from '@/lib/supabase';

export default function Testimonies() {
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ testimonies: Testimony[] }>('/api/testimonies');
      setTestimonies(res.testimonies || []);
    } catch {
      setTestimonies([]);
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-6 pt-8 pb-24">
      <div className="mb-12 text-center">
        <p className="eyebrow mb-3">Stories of hope</p>
        <h1 className="font-display text-4xl font-medium text-ink-800 sm:text-5xl">Testimonies</h1>
        <p className="mx-auto mt-4 max-w-xl text-ink-500">
          What happened after a prayer was answered. Read what others have shared and when the
          time is right, share your own.
        </p>
        <button onClick={() => setShowForm(true)} className="btn-primary mt-8">
          <Plus className="h-4 w-4" />
          Share your testimony
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-lavender-400" />
        </div>
      ) : testimonies.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-8 text-center sm:p-16">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-lavender-100 text-lavender-500">
            <Quote className="h-6 w-6" strokeWidth={1.5} />
          </span>
          <h3 className="font-display text-xl font-medium text-ink-700">No testimonies yet</h3>
          <p className="max-w-sm text-sm text-ink-500">
            Be the first to share what God has done. Your story could be exactly what someone else
            needs to read.
          </p>
        </div>
      ) : (
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
          {testimonies.map((t, i) => (
            <TestimonyCard key={t.id} testimony={t} index={i} />
          ))}
        </div>
      )}

      {showForm && (
        <TestimonyForm
          onClose={() => setShowForm(false)}
          onSubmitted={() => {
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

const CARD_TINTS = ['bg-parchment-50', 'bg-lavender-50/60', 'bg-gold-500/5'];

function TestimonyCard({ testimony, index }: { testimony: Testimony; index: number }) {
  const tint = CARD_TINTS[index % CARD_TINTS.length];
  return (
    <div className={`card ${tint} mb-6 break-inside-avoid p-6 transition-all duration-500 hover:shadow-md`}>
      <Quote className="mb-3 h-5 w-5 text-gold-500/60" strokeWidth={1} />
      <h3 className="font-display text-lg font-semibold leading-snug text-ink-800">{testimony.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-ink-600">{testimony.body}</p>
      <div className="mt-5 flex items-center gap-2 border-t border-parchment-200 pt-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-lavender-100 text-lavender-600">
          <Heart className="h-3 w-3" strokeWidth={1.5} />
        </span>
        <div>
          <p className="text-xs font-medium text-ink-700">
            {testimony.author_name || 'Anonymous'}
          </p>
          <p className="text-[11px] text-ink-400">
            {new Date(testimony.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
          </p>
        </div>
      </div>
    </div>
  );
}

function TestimonyForm({ onClose, onSubmitted }: { onClose: () => void; onSubmitted: () => void }) {
  const [name, setName] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/api/testimonies', {
        author_name: anonymous ? null : name.trim() || null,
        title: title.trim(),
        body: body.trim(),
      });
      setDone(true);
    } catch (e: any) {
      setError(e?.message || 'Something went wrong. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-lg p-6 animate-fade-up">
        {done ? (
          <div className="text-center py-4">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-lavender-100 text-lavender-600">
              <CheckCircle2 className="h-6 w-6" strokeWidth={1.5} />
            </span>
            <h3 className="font-display text-xl font-semibold text-ink-800">Thank you for sharing</h3>
            <p className="mt-2 text-sm text-ink-500">
              Your testimony has been received. A spiritual leader will review it before it appears
              publicly, to keep this space safe for everyone.
            </p>
            <button onClick={onSubmitted} className="btn-primary mt-5 w-full">
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lavender-100 text-lavender-600">
                <Sparkles className="h-4 w-4" />
              </span>
              <h3 className="font-display text-lg font-semibold text-ink-800">Share your testimony</h3>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAnonymous(true)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                    anonymous ? 'border-lavender-500 bg-lavender-50' : 'border-parchment-200'
                  }`}
                >
                  Anonymous
                </button>
                <button
                  type="button"
                  onClick={() => setAnonymous(false)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                    !anonymous ? 'border-lavender-500 bg-lavender-50' : 'border-parchment-200'
                  }`}
                >
                  With my name
                </button>
              </div>

              {!anonymous && (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="input-field py-2 text-sm"
                />
              )}

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="A short title — what happened?"
                className="input-field py-2 text-sm"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                placeholder="Share what God did, how the prayer was answered, what changed..."
                className="input-field resize-none text-sm"
              />

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button onClick={onClose} className="btn-ghost flex-1 py-2.5">
                  Cancel
                </button>
                <button
                  onClick={submit}
                  disabled={submitting || !title.trim() || !body.trim()}
                  className="btn-primary flex-1 py-2.5"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Submit
                </button>
              </div>
              <p className="text-center text-xs text-ink-400">
                Testimonies are reviewed before they appear publicly.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
