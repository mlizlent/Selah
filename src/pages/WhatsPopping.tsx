import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { PriestessPost } from '@/lib/supabase';

export default function WhatsPopping() {
  const [posts, setPosts] = useState<PriestessPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePost, setActivePost] = useState<PriestessPost | null>(null);

  const load = async () => {
    try {
      const res = await fetch('/api/posts');
      const json = await res.json();
      if (json.posts) setPosts(json.posts);
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
        <h1 className="font-display text-3xl font-medium text-ink-800 sm:text-4xl">
          What's popping
        </h1>
        <p className="mt-2 text-sm text-ink-500">Our Weapon Is Prayer</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-lavender-400" />
        </div>
      ) : posts.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-16 text-center">
          <h3 className="font-display text-xl font-medium text-ink-700">No updates yet</h3>
          <p className="max-w-sm text-sm text-ink-500">Check back soon for community updates.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <button
              key={post.id}
              onClick={() => setActivePost(post)}
              className="card h-full p-6 text-left transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-lavender-600/10"
            >
              <h3 className="font-display text-lg font-semibold text-ink-800 line-clamp-2">{post.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-500 line-clamp-3">{post.body}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.24em] text-ink-400">
                {new Date(post.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
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
              <h2 className="font-display text-xl font-semibold text-ink-800">{activePost.title}</h2>
              <button
                onClick={() => setActivePost(null)}
                className="rounded-full p-2 text-ink-500 transition-colors hover:bg-parchment-100 hover:text-ink-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-6">
              <p className="text-xs uppercase tracking-wide text-ink-400 mb-4">
                {new Date(activePost.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
              </p>
              <p className="whitespace-pre-line text-base leading-relaxed text-ink-700">{activePost.body}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
