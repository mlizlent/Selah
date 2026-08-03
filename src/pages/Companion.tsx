import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  BookOpen,
  HandHeart,
  CalendarHeart,
  AlertCircle,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Phone,
} from 'lucide-react';
import { fetchCompanionReply } from '@/lib/ai';
import { generateReply, GREETING } from '@/lib/companion';
import type { CompanionReply } from '@/lib/companion';
import { CRISIS_RESOURCES } from '@/lib/crisis';
import { supabase } from '@/lib/supabase';
import type { PrayerCategory } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'companion';
  text: string;
  verses?: { reference: string; text: string }[];
  showEscalation?: boolean;
  isCrisis?: boolean;
}

const SUGGESTIONS = [
  "I've been anxious about everything lately",
  "I'm grieving someone I lost",
  "What does the Bible say about money and provision?",
  "How do I forgive someone who hurt me?",
  "What does Scripture say about purpose and direction?",
  "What does the Bible say about the meaning of purple?",
  "I'm in a conflict with my family and don't know what to do",
];

export default function Companion() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'greet', role: 'companion', text: GREETING },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [escalation, setEscalation] = useState<'prayer' | 'appointment' | null>(null);
  const [apiNotice, setApiNotice] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || thinking) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', text: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setThinking(true);

    let reply: CompanionReply;
    try {
      reply = await fetchCompanionReply(trimmed);
      setApiNotice(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.warn('LLM companion failed, using fallback:', error);
      setApiNotice('Nia is temporarily unavailable right now, so a fallback response is being used.');
      reply = generateReply(trimmed);
    }

    setMessages((m) => [
      ...m,
      {
        id: crypto.randomUUID(),
        role: 'companion',
        text: reply.text,
        verses: reply.verses,
        showEscalation: reply.showEscalation,
        isCrisis: reply.isCrisis,
      },
    ]);
    setThinking(false);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 pb-12 sm:px-6">
      <div className="mb-6 text-center">
        <p className="eyebrow mb-2">A quiet space</p>
        <h1 className="font-display text-3xl font-medium text-ink-800 sm:text-4xl">Nia</h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-ink-500">
          Share a struggle, ask a Bible question, or explore a topic in Scripture. Nia
          will respond with comfort, insight, and verses that fit your situation.
        </p>
      </div>

      <div className="card flex h-[62vh] min-h-[460px] flex-col overflow-hidden">
        {apiNotice && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
            {apiNotice}
          </div>
        )}
        {/* messages */}
        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} onEscalate={(t) => setEscalation(t)} />
          ))}
          {thinking && (
            <div className="flex items-center gap-2 text-ink-400">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lavender-100 text-lavender-500">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-soft-pulse rounded-full bg-lavender-300" />
                <span className="h-2 w-2 animate-soft-pulse rounded-full bg-lavender-300" style={{ animationDelay: '0.3s' }} />
                <span className="h-2 w-2 animate-soft-pulse rounded-full bg-lavender-300" style={{ animationDelay: '0.6s' }} />
              </div>
            </div>
          )}
        </div>

        {/* suggestions (only at start) */}
        {messages.length <= 1 && (
          <div className="border-t border-parchment-200 px-5 pt-4 sm:px-6">
            <p className="mb-2 text-xs text-ink-400">Not sure where to start? Try one of these:</p>
            <div className="flex flex-wrap gap-2 pb-3">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-parchment-200 bg-parchment-50 px-3 py-1.5 text-xs text-ink-600 transition-colors hover:border-lavender-300 hover:bg-lavender-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* input */}
        <div className="border-t border-parchment-200 p-3 sm:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={1}
              placeholder="Share a struggle, ask a Bible question, or explore a topic in Scripture..."
              className="input-field max-h-32 resize-none py-2.5 placeholder:text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              className="btn-primary shrink-0 px-4 py-2.5"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {escalation && (
        <EscalationModal
          type={escalation}
          onClose={() => setEscalation(null)}
          lastUserText={messages.filter((m) => m.role === 'user').slice(-1)[0]?.text ?? ''}
        />
      )}
    </div>
  );
}

function MessageBubble({
  message,
  onEscalate,
}: {
  message: Message;
  onEscalate: (t: 'prayer' | 'appointment') => void;
}) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end animate-fade-up">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-lavender-600 px-4 py-3 text-sm leading-relaxed text-parchment-50">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start animate-fade-up">
      <span className="mr-2 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lavender-100 text-lavender-600">
        <Sparkles className="h-4 w-4" strokeWidth={1.5} />
      </span>
      <div className="max-w-[85%] space-y-3">
        <div className="rounded-2xl rounded-bl-md bg-parchment-100 px-4 py-3 text-sm leading-relaxed text-ink-700">
          {message.text}
        </div>

        {message.isCrisis && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-wide2">Please reach out now</p>
            </div>
            <ul className="mt-3 space-y-1.5">
              {CRISIS_RESOURCES.map((r) => (
                <li key={r.name} className="text-sm text-red-700">
                  <span className="font-medium">{r.name}</span> — {r.contact}
                  <a href={r.url} target="_blank" rel="noreferrer" className="ml-1 underline">
                    {r.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {message.verses && message.verses.length > 0 && (
          <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide2 text-gold-600">
              <BookOpen className="h-3.5 w-3.5" />
              Scripture for this moment
            </p>
            {message.verses.map((v) => (
              <div key={v.reference} className="verse-card">
                <p className="font-display text-base italic leading-relaxed text-ink-700">"{v.text}"</p>
                <p className="mt-1.5 text-xs font-medium uppercase tracking-wide2 text-gold-600">{v.reference}</p>
              </div>
            ))}
          </div>
        )}

        {message.showEscalation && !message.isCrisis && (
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => onEscalate('prayer')}
              className="inline-flex items-center gap-1.5 rounded-full border border-lavender-300 bg-lavender-50 px-3 py-1.5 text-xs font-medium text-lavender-700 transition-colors hover:bg-lavender-100"
            >
              <HandHeart className="h-3.5 w-3.5" />
              Send this as a prayer request
            </button>
            <button
              onClick={() => onEscalate('appointment')}
              className="inline-flex items-center gap-1.5 rounded-full border border-gold-400 bg-gold-500/10 px-3 py-1.5 text-xs font-medium text-gold-600 transition-colors hover:bg-gold-500/20"
            >
              <CalendarHeart className="h-3.5 w-3.5" />
              Book an appointment with the Priestess
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EscalationModal({
  type,
  onClose,
  lastUserText,
}: {
  type: 'prayer' | 'appointment';
  onClose: () => void;
  lastUserText: string;
}) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [category, setCategory] = useState<PrayerCategory>('other');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submitPrayer = async () => {
    setSubmitting(true);
    setError(null);
    const { data, error } = await supabase
      .from('prayer_requests')
      .insert({
        name: anonymous ? null : name.trim() || null,
        category,
        body: lastUserText,
      })
      .select()
      .single();
    setSubmitting(false);
    if (error) {
      setError('Something went wrong. Please try again.');
      return;
    }
    setDone((data as { id: string }).id);
  };

  const submitAppointment = async () => {
    setSubmitting(true);
    setError(null);
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        name: anonymous ? null : name.trim() || null,
        contact: contact.trim(),
        reason: lastUserText,
      })
      .select()
      .single();
    setSubmitting(false);
    if (error) {
      setError('Something went wrong. Please try again.');
      return;
    }
    setDone((data as { id: string }).id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-md p-6 animate-fade-up">
        {done ? (
          <div className="text-center">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-lavender-100 text-lavender-600">
              <CheckCircle2 className="h-6 w-6" strokeWidth={1.5} />
            </span>
            <h3 className="font-display text-xl font-semibold text-ink-800">
              {type === 'prayer' ? 'Your prayer request was sent' : 'Your appointment request was sent'}
            </h3>
            <p className="mt-2 text-sm text-ink-500">
              {type === 'prayer'
                ? 'A spiritual leader will pray over what you shared.'
                : 'The Priestess will reach out to schedule a time with you.'}
            </p>
            <p className="mt-4 rounded-lg bg-lavender-50 px-3 py-2 font-mono text-xs text-ink-600 select-all">{done}</p>
            <button onClick={onClose} className="btn-primary mt-5 w-full">
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lavender-100 text-lavender-600">
                {type === 'prayer' ? <HandHeart className="h-4 w-4" /> : <CalendarHeart className="h-4 w-4" />}
              </span>
              <h3 className="font-display text-lg font-semibold text-ink-800">
                {type === 'prayer' ? 'Send as a prayer request' : 'Book an appointment'}
              </h3>
            </div>

            <p className="mb-4 rounded-lg bg-parchment-100 px-3 py-2 text-xs italic text-ink-500">
              "{lastUserText.slice(0, 140)}{lastUserText.length > 140 ? '...' : ''}"
            </p>

            <div className="space-y-4">
              <div>
                <div className="mb-2 flex gap-2">
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
              </div>

              {type === 'prayer' ? (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-600">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PrayerCategory)}
                    className="input-field py-2 text-sm"
                  >
                    <option value="anxiety">Anxiety & Fear</option>
                    <option value="grief">Grief & Loss</option>
                    <option value="finances">Financial Stress</option>
                    <option value="relationships">Relationships</option>
                    <option value="health">Health & Healing</option>
                    <option value="guidance">Guidance & Direction</option>
                    <option value="gratitude">Gratitude</option>
                    <option value="other">Something Else</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink-600">
                    How can the Priestess reach you? <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Phone or email"
                    className="input-field py-2 text-sm"
                  />
                </div>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex gap-2 pt-1">
                <button onClick={onClose} className="btn-ghost flex-1 py-2.5">
                  Cancel
                </button>
                <button
                  onClick={type === 'prayer' ? submitPrayer : submitAppointment}
                  disabled={submitting || (type === 'appointment' && !contact.trim())}
                  className="btn-primary flex-1 py-2.5"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      {type === 'prayer' ? 'Send' : 'Request'}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
