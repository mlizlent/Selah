import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { PriestessPost } from '@/lib/supabase';

export default function WhatsPopping() {
  const [posts, setPosts] = useState<PriestessPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from('priestess_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setPosts(data as PriestessPost[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="mx-auto max-w-3xl px-6 pt-8 pb-24">
      <div className="mb-10 text-center">
        <p className="eyebrow mb-2">Community</p>
        <h1 className="font-display text-3xl font-medium text-ink-800 sm:text-4xl">
          What's popping
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          Updates, encouragement, and announcements from the Priestess.
        </p>
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
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="card overflow-hidden">
              <button
                onClick={() => toggleExpand(post.id)}
                className="flex w-full items-center justify-between gap-3 p-5 text-left transition-colors hover:bg-parchment-50/50"
              >
                <div className="flex-1">
                  <h3 className="font-display text-lg font-semibold text-ink-800">{post.title}</h3>
                  <p className="mt-1 text-xs text-ink-400">
                    {new Date(post.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </p>
                </div>
                {expandedId === post.id ? (
                  <ChevronUp className="h-4 w-4 text-ink-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-ink-400" />
                )}
              </button>
              {expandedId === post.id && (
                <div className="border-t border-parchment-200 px-5 py-4">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-ink-600">{post.body}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
