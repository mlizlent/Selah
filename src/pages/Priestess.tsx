import { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  HandHeart,
  CheckCircle2,
  Loader2,
  Mail,
  CalendarHeart,
  BookOpen,
  Check,
  X,
  RefreshCw,
  Inbox,
  Calendar,
  Sparkles,
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { supabase, PRAYER_CATEGORIES } from '@/lib/supabase';
import type { PrayerRequest, Testimony, Appointment, PrayerStatus, PrayerCategory, PriestessPost } from '@/lib/supabase';
import ConfirmDialog from '@/components/ConfirmDialog';
import { CardSkeleton, VerseSkeleton } from '@/components/Skeletons';
import { useAuth } from '@/contexts/AuthContext';

type Tab = 'prayer' | 'appointments' | 'testimonies' | 'posts';

export default function Priestess() {
  const [tab, setTab] = useState<Tab>('prayer');
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [posts, setPosts] = useState<PriestessPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [reqRes, apptRes, testRes] = await Promise.all([
      supabase.from('prayer_requests').select('*').order('created_at', { ascending: false }),
      supabase.from('appointments').select('*').order('created_at', { ascending: false }),
      supabase.from('testimonies').select('*').order('created_at', { ascending: false }),
    ]);
    if (reqRes.data) setRequests(reqRes.data as PrayerRequest[]);
    if (apptRes.data) setAppointments(apptRes.data as Appointment[]);
    if (testRes.data) setTestimonies(testRes.data as Testimony[]);

    try {
      const postRes = await fetch('/api/posts');
      const json = await postRes.json();
      if (json.posts) setPosts(json.posts);
    } catch {
      // silent
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const pendingAppts = appointments.filter((a) => a.status === 'pending').length;
  const pendingTestimonies = testimonies.filter((t) => !t.approved).length;

  return (
    <div className="mx-auto max-w-5xl px-6 pt-8 pb-24">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">Spiritual care</p>
          <h1 className="font-display text-3xl font-medium text-ink-800 sm:text-4xl">Priestess Dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">Tend the queue. Pray. Respond. Approve.</p>
        </div>
        <button onClick={load} className="btn-ghost py-2.5">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* tabs */}
      <div className="mb-8 flex gap-1 rounded-full border border-parchment-200 bg-parchment-50/60 p-1">
        <TabButton active={tab === 'prayer'} onClick={() => setTab('prayer')} icon={Inbox} label="Prayer Queue" badge={pendingCount} />
        <TabButton active={tab === 'appointments'} onClick={() => setTab('appointments')} icon={CalendarHeart} label="Appointments" badge={pendingAppts} />
        <TabButton active={tab === 'testimonies'} onClick={() => setTab('testimonies')} icon={BookOpen} label="Testimonies" badge={pendingTestimonies} />
        <TabButton active={tab === 'posts'} onClick={() => setTab('posts')} icon={Megaphone} label="Posts" badge={posts.length} />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : tab === 'prayer' ? (
        <PrayerQueue requests={requests} onUpdate={load} />
      ) : tab === 'appointments' ? (
        <AppointmentList appointments={appointments} onUpdate={load} />
      ) : tab === 'posts' ? (
        <PriestessPosts posts={posts} onUpdate={load} />
      ) : (
        <TestimonyReview testimonies={testimonies} onUpdate={load} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
  label: string;
  badge: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
        active ? 'bg-lavender-600 text-parchment-50 shadow-sm' : 'text-ink-500 hover:text-lavender-600'
      }`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.5} />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label.split(' ')[0]}</span>
      {badge > 0 && (
        <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
          active ? 'bg-parchment-50/25 text-parchment-50' : 'bg-gold-500 text-ink-900'
        }`}>
          {badge}
        </span>
      )}
    </button>
  );
}

const STATUS_META: Record<PrayerStatus, { label: string; icon: LucideIcon; color: string; bg: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-ink-500', bg: 'bg-parchment-100' },
  praying: { label: 'Praying', icon: HandHeart, color: 'text-gold-600', bg: 'bg-gold-500/10' },
  prayed: { label: 'Prayed', icon: CheckCircle2, color: 'text-lavender-600', bg: 'bg-lavender-50' },
};

const CAT_LABEL = (c: PrayerCategory) => PRAYER_CATEGORIES.find((x) => x.value === c)?.label ?? c;

function PrayerQueue({ requests, onUpdate }: { requests: PrayerRequest[]; onUpdate: () => void }) {
  const [note, setNote] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const updateStatus = async (id: string, status: PrayerStatus, prayedNote?: string) => {
    setBusy(id);
    const patch: Record<string, unknown> = { status };
    if (status === 'prayed') {
      patch.prayed_at = new Date().toISOString();
      if (prayedNote !== undefined) patch.prayed_note = prayedNote;
    }
    await supabase.from('prayer_requests').update(patch).eq('id', id);
    setBusy(null);
    onUpdate();
  };

  if (requests.length === 0) {
    return <EmptyState icon={Inbox} title="The queue is quiet" desc="No prayer requests yet. When someone sends one, it will appear here." />;
  }

  return (
    <div className="space-y-4">
      {requests.map((r) => {
        const meta = STATUS_META[r.status];
        return (
          <div key={r.id} className="card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full ${meta.bg} px-2.5 py-1 text-xs font-medium ${meta.color}`}>
                    <meta.icon className="h-3 w-3" strokeWidth={2} />
                    {meta.label}
                  </span>
                  <span className="rounded-full bg-parchment-100 px-2.5 py-1 text-xs text-ink-600">{CAT_LABEL(r.category)}</span>
                  <span className="text-xs text-ink-400">
                    {r.name ? `from ${r.name}` : 'anonymous'} · {new Date(r.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-700">{r.body}</p>
                {r.prayed_note && (
                  <div className="mt-3 verse-card">
                    <p className="eyebrow text-gold-600">Your note</p>
                    <p className="mt-1 font-display text-sm italic text-ink-700">"{r.prayed_note}"</p>
                  </div>
                )}
              </div>
            </div>

            {r.status !== 'prayed' && (
              <div className="mt-4 border-t border-parchment-200 pt-4">
                <input
                  value={note[r.id] ?? ''}
                  onChange={(e) => setNote((n) => ({ ...n, [r.id]: e.target.value }))}
                  placeholder="A short note for the seeker (optional)..."
                  className="input-field py-2 text-sm"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(r.id, 'praying')}
                      disabled={busy === r.id}
                      className="btn-ghost py-2 text-xs"
                    >
                      {busy === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <HandHeart className="h-3.5 w-3.5" />}
                      Mark as praying
                    </button>
                  )}
                  <button
                    onClick={() => updateStatus(r.id, 'prayed', note[r.id]?.trim() || undefined)}
                    disabled={busy === r.id}
                    className="btn-primary py-2 text-xs"
                  >
                    {busy === r.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    Mark as prayed
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AppointmentList({ appointments, onUpdate }: { appointments: Appointment[]; onUpdate: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);

  const updateStatus = async (id: string, status: 'scheduled' | 'completed') => {
    setBusy(id);
    await supabase.from('appointments').update({ status }).eq('id', id);
    setBusy(null);
    onUpdate();
  };

  if (appointments.length === 0) {
    return <EmptyState icon={Calendar} title="No appointment requests" desc="When someone asks to book time with you, it will appear here." />;
  }

  const APPT_META: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: 'Pending', color: 'text-ink-500', bg: 'bg-parchment-100' },
    scheduled: { label: 'Scheduled', color: 'text-gold-600', bg: 'bg-gold-500/10' },
    completed: { label: 'Completed', color: 'text-lavender-600', bg: 'bg-lavender-50' },
  };

  return (
    <div className="space-y-4">
      {appointments.map((a) => {
        const meta = APPT_META[a.status];
        return (
          <div key={a.id} className="card p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full ${meta.bg} px-2.5 py-1 text-xs font-medium ${meta.color}`}>
                {meta.label}
              </span>
              <span className="text-xs text-ink-400">
                {a.name ? a.name : 'anonymous'} · {new Date(a.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-700">{a.reason}</p>
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-parchment-100 px-3 py-2 text-sm text-ink-700">
              <Mail className="h-4 w-4 text-lavender-600" />
              <span className="font-medium">{a.contact}</span>
            </div>
            {a.status !== 'completed' && (
              <div className="mt-3 flex flex-wrap gap-2">
                {a.status === 'pending' && (
                  <button onClick={() => updateStatus(a.id, 'scheduled')} disabled={busy === a.id} className="btn-ghost py-2 text-xs">
                    {busy === a.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CalendarHeart className="h-3.5 w-3.5" />}
                    Mark scheduled
                  </button>
                )}
                <button onClick={() => updateStatus(a.id, 'completed')} disabled={busy === a.id} className="btn-primary py-2 text-xs">
                  {busy === a.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  Mark completed
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PriestessPosts({ posts, onUpdate }: { posts: PriestessPost[]; onUpdate: () => void }) {
  const { session } = useAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editBusy, setEditBusy] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearBusy, setClearBusy] = useState(false);
  const [clearMessage, setClearMessage] = useState<string | null>(null);

  const getHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }
    return headers;
  };

  const submitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ title: title.trim(), message: body.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
    } catch {
      setMessage('Could not post right now.');
      setBusy(false);
      return;
    }
    setBusy(false);
    setTitle('');
    setBody('');
    setMessage('Posted!');
    onUpdate();
  };

  const startEdit = (post: PriestessPost) => {
    setEditingId(post.id);
    setEditTitle(post.title);
    setEditBody(post.body);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditBody('');
  };

  const saveEdit = async (id: string) => {
    if (!editTitle.trim() || !editBody.trim()) return;
    setEditBusy(id);
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ title: editTitle.trim(), message: editBody.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
    } catch {
      setEditBusy(null);
      return;
    }
    setEditBusy(null);
    setEditingId(null);
    onUpdate();
  };

  const deletePost = async (id: string) => {
    setDeleteBusy(id);
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error);
      }
    } catch {
      setDeleteBusy(null);
      return;
    }
    setDeleteBusy(null);
    if (editingId === id) cancelEdit();
    onUpdate();
  };

  const askDelete = (id: string) => {
    setDeleteTarget(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deletePost(deleteTarget);
    }
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const handleClearAll = async () => {
    setClearBusy(true);
    setClearMessage(null);
    try {
      const res = await fetch('/api/admin/clear-posts', {
        method: 'POST',
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setClearMessage('All posts cleared.');
      onUpdate();
    } catch {
      setClearMessage('Failed to clear posts.');
    }
    setClearBusy(false);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={submitPost} className="card space-y-4 p-6">
        <div>
          <p className="eyebrow text-lavender-600">Community updates</p>
          <h3 className="font-display text-xl font-semibold text-ink-800">Create a post</h3>
          <p className="mt-1 text-sm text-ink-500">Share something with the Selah community. It will appear on the "What's popping" page.</p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-ink-700">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's on your heart?" className="input-field" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-ink-700">Message</label>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="Write a message for the community..." className="input-field resize-none" />
        </div>
        {message && <p className="rounded-lg bg-lavender-50 px-4 py-3 text-sm text-lavender-700">{message}</p>}
        <button type="submit" disabled={busy || !title.trim() || !body.trim()} className="btn-primary">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Publish post
        </button>
      </form>

      {posts.length === 0 ? (
        <EmptyState icon={Megaphone} title="No posts yet" desc="Your first message will appear here once you publish it." />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-ink-800">Posts ({posts.length})</h3>
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={clearBusy}
              className="btn-ghost py-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear all
            </button>
          </div>
          {posts.map((post) => (
            <div key={post.id} className="card p-5">
              {editingId === post.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-ink-700">Title</label>
                    <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-ink-700">Message</label>
                    <textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={4} className="input-field resize-none" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(post.id)} disabled={editBusy === post.id || !editTitle.trim() || !editBody.trim()} className="btn-primary py-2.5 text-xs">
                      {editBusy === post.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      Save
                    </button>
                    <button onClick={cancelEdit} className="btn-ghost py-2.5 text-xs">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-display text-lg font-semibold text-ink-800">{post.title}</h4>
                    <span className="text-xs text-ink-400">
                      {new Date(post.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink-600">{post.body}</p>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => startEdit(post)} className="btn-ghost py-2.5 text-xs">
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button onClick={() => askDelete(post.id)} disabled={deleteBusy === post.id} className="btn-ghost py-2.5 text-xs text-red-600 hover:text-red-700">
                      {deleteBusy === post.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete post?"
        message="This will permanently remove this post from the community feed."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }}
        danger
      />

      <ConfirmDialog
        open={showClearConfirm}
        title="Clear all posts?"
        message="This will permanently delete all posts from the community feed. This action cannot be undone."
        confirmLabel="Clear all"
        cancelLabel="Cancel"
        onConfirm={handleClearAll}
        onCancel={() => setShowClearConfirm(false)}
        danger
      />

      {clearMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-parchment-200 bg-parchment-50 px-5 py-3 text-sm shadow-lg">
          {clearMessage}
        </div>
      )}
    </div>
  );
}

function TestimonyReview({ testimonies, onUpdate }: { testimonies: Testimony[]; onUpdate: () => void }) {
  const { session } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearBusy, setClearBusy] = useState(false);
  const [clearMessage, setClearMessage] = useState<string | null>(null);

  const getHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }
    return headers;
  };

  const approve = async (id: string) => {
    setBusy(id);
    await supabase.from('testimonies').update({ approved: true }).eq('id', id);
    setBusy(null);
    onUpdate();
  };

  const reject = async (id: string) => {
    setBusy(id);
    await supabase.from('testimonies').delete().eq('id', id);
    setBusy(null);
    onUpdate();
  };

  const askReject = (id: string) => {
    setRejectTarget(id);
    setShowRejectConfirm(true);
  };

  const confirmReject = () => {
    if (rejectTarget) {
      reject(rejectTarget);
    }
    setShowRejectConfirm(false);
    setRejectTarget(null);
  };

  const handleClearAll = async () => {
    setClearBusy(true);
    setClearMessage(null);
    try {
      const res = await fetch('/api/admin/clear-testimonies', {
        method: 'POST',
        headers: getHeaders(),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setClearMessage('All testimonies cleared.');
      onUpdate();
    } catch {
      setClearMessage('Failed to clear testimonies.');
    }
    setClearBusy(false);
  };

  if (testimonies.length === 0) {
    return <EmptyState icon={BookOpen} title="No testimonies yet" desc="When someone shares their story, it will appear here for review." />;
  }

  const pending = testimonies.filter((t) => !t.approved);
  const approved = testimonies.filter((t) => t.approved);

  return (
    <div className="space-y-8">
      {pending.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-800">
              <Sparkles className="h-4 w-4 text-gold-500" />
              Awaiting review ({pending.length})
            </h3>
            <button
              onClick={() => setShowClearConfirm(true)}
              disabled={clearBusy}
              className="btn-ghost py-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear all
            </button>
          </div>
          <div className="space-y-4">
            {pending.map((t) => (
              <div key={t.id} className="card border-gold-400/40 p-5">
                <h4 className="font-display text-base font-semibold text-ink-800">{t.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{t.body}</p>
                <p className="mt-2 text-xs text-ink-400">
                  {t.author_name || 'Anonymous'} · {new Date(t.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => approve(t.id)} disabled={busy === t.id} className="btn-primary py-2.5 text-xs">
                    {busy === t.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    Approve
                  </button>
                  <button onClick={() => askReject(t.id)} disabled={busy === t.id} className="btn-ghost py-2.5 text-xs">
                    {busy === t.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {approved.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-ink-800">
            <CheckCircle2 className="h-4 w-4 text-lavender-500" />
            Published ({approved.length})
          </h3>
          <div className="space-y-3">
            {approved.map((t) => (
              <div key={t.id} className="card p-4 opacity-75">
                <h4 className="font-display text-sm font-semibold text-ink-700">{t.title}</h4>
                <p className="mt-1 text-xs text-ink-400">
                  {t.author_name || 'Anonymous'} · {new Date(t.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <ConfirmDialog
        open={showRejectConfirm}
        title="Remove testimony?"
        message="This will permanently delete this testimony. This action cannot be undone."
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={confirmReject}
        onCancel={() => { setShowRejectConfirm(false); setRejectTarget(null); }}
        danger
      />

      <ConfirmDialog
        open={showClearConfirm}
        title="Clear all testimonies?"
        message="This will permanently delete all testimonies from the database. This action cannot be undone."
        confirmLabel="Clear all"
        cancelLabel="Cancel"
        onConfirm={handleClearAll}
        onCancel={() => setShowClearConfirm(false)}
        danger
      />

      {clearMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-parchment-200 bg-parchment-50 px-5 py-3 text-sm shadow-lg">
          {clearMessage}
        </div>
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  desc,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
}) {
  return (
    <div className="card flex flex-col items-center gap-3 p-8 text-center sm:p-12">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lavender-100 text-lavender-600">
        <Icon className="h-5 w-5" strokeWidth={1.5} />
      </span>
      <h3 className="font-display text-lg font-semibold text-ink-800">{title}</h3>
      <p className="max-w-xs text-sm text-ink-500">{desc}</p>
    </div>
  );
}
