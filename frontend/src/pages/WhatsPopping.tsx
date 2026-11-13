import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { PriestessPost } from '@/lib/supabase';
import { PostCardSkeleton } from '@/components/Skeletons';
import { api } from '@/lib/api';

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export default function WhatsPopping() {
  const [posts, setPosts] = useState<PriestessPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePost, setActivePost] = useState<PriestessPost | null>(null);

  const load = async () => {
    try {
      const res = await api.get<{ posts: PriestessPost[] }>('/api/posts');
      if (res.posts) setPosts(res.posts);
    } catch {
      // silent
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 pt-8 pb-24">
      <div className="mb-10 text-center">
        <p className="eyebrow mb-2">Community</p>
        <h1 className="font-display text-d-headline font-medium text-ink-800 sm:text-d-headline">
          What's popping
        </h1>
        <p className="mt-2 text-d-body text-ink-500">Our Weapon Is Prayer</p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-8 text-center sm:p-16">
          <h3 className="font-display text-d-title font-medium text-ink-700">No updates yet</h3>
          <p className="max-w-sm text-d-body text-ink-500">Check back soon for community updates.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <button
              key={post.id}
              onClick={() => setActivePost(post)}
              className="card h-full p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-lavender-600/10"
            >
              <h3 className="font-display text-d-title font-semibold text-ink-800 line-clamp-2">{post.title}</h3>
              <p className="mt-3 text-d-body leading-relaxed text-ink-500 line-clamp-3">{post.body}</p>
              <p className="mt-4 text-d-label uppercase tracking-[0.24em] text-ink-400">
                {timeAgo(post.created_at)}
              </p>
            </button>
          ))}
        </div>
      )}

      {activePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={() => setActivePost(null)} />
          <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-parchment-200 bg-parchment-50 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-parchment-200 bg-parchment-50/95 px-6 py-4 backdrop-blur-sm">
              <h2 className="font-display text-d-title font-semibold text-ink-800">{activePost.title}</h2>
              <button
                onClick={() => setActivePost(null)}
                className="rounded-full p-2 text-ink-500 transition-colors hover:bg-parchment-100 hover:text-ink-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-6">
              <p className="text-d-label uppercase tracking-wide text-ink-400 mb-4">
                {timeAgo(activePost.created_at)}
              </p>
              <p className="whitespace-pre-line text-d-body leading-relaxed text-ink-700">{activePost.body}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
