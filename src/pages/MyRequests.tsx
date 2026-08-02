import { useState, useEffect } from 'react';
import { Loader2, User, Mail, CalendarHeart, Clock, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { PrayerRequest, Appointment } from '@/lib/supabase';

const STATUS_META: Record<string, { label: string; icon: typeof Clock; color: string; bg: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-ink-500', bg: 'bg-parchment-100' },
  praying: { label: 'Being prayed over', icon: Clock, color: 'text-gold-600', bg: 'bg-gold-500/10' },
  prayed: { label: 'Prayed for', icon: CheckCircle2, color: 'text-lavender-600', bg: 'bg-lavender-50' },
  scheduled: { label: 'Scheduled', icon: CalendarHeart, color: 'text-gold-600', bg: 'bg-gold-500/10' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-lavender-600', bg: 'bg-lavender-50' },
};

export default function MyRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [reqRes, apptRes] = await Promise.all([
      supabase.from('prayer_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('appointments').select('*').order('created_at', { ascending: false }),
    ]);
    if (reqRes.data) setRequests(reqRes.data as PrayerRequest[]);
    if (apptRes.data) setAppointments(apptRes.data as Appointment[]);
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-6 pt-8 pb-24">
        <div className="card flex flex-col items-center gap-3 p-16 text-center">
          <h3 className="font-display text-xl font-medium text-ink-700">Sign in required</h3>
          <p className="max-w-sm text-sm text-ink-500">Please sign in to view your requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 pt-8 pb-24">
      <div className="mb-10 text-center">
        <p className="eyebrow mb-2">Your journey</p>
        <h1 className="font-display text-3xl font-medium text-ink-800 sm:text-4xl">My Requests</h1>
        <p className="mt-2 text-sm text-ink-500">Track your prayer requests and appointments.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-lavender-400" />
        </div>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="font-display text-lg font-semibold text-ink-800 mb-4">Prayer Requests</h2>
            {requests.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-sm text-ink-500">No prayer requests yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((r) => {
                  const meta = STATUS_META[r.status] || STATUS_META.pending;
                  return (
                    <div key={r.id} className="card p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full ${meta.bg} px-2.5 py-1 text-xs font-medium ${meta.color}`}>
                          <meta.icon className="h-3 w-3" strokeWidth={2} />
                          {meta.label}
                        </span>
                        <span className="rounded-full bg-parchment-100 px-2.5 py-1 text-xs text-ink-600">{r.category}</span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-ink-700">{r.body}</p>
                      {r.prayed_note && (
                        <div className="mt-3 verse-card">
                          <p className="eyebrow text-gold-600">A note for you</p>
                          <p className="mt-1 font-display text-sm italic text-ink-700">"{r.prayed_note}"</p>
                        </div>
                      )}
                      <p className="mt-3 text-xs text-ink-400">
                        {new Date(r.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-ink-800 mb-4">Appointments</h2>
            {appointments.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-sm text-ink-500">No appointments yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((a) => {
                  const meta = STATUS_META[a.status] || STATUS_META.pending;
                  return (
                    <div key={a.id} className="card p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full ${meta.bg} px-2.5 py-1 text-xs font-medium ${meta.color}`}>
                          {meta.label}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-ink-700">{a.reason}</p>
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-parchment-100 px-3 py-2 text-sm text-ink-700">
                        <Mail className="h-4 w-4 text-lavender-600" />
                        <span className="font-medium">{a.contact}</span>
                      </div>
                      <p className="mt-3 text-xs text-ink-400">
                        {new Date(a.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
