import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { pathToFileURL } from 'url';
import ws from 'ws';

let cachedKey: string | null = null;

async function loadServiceRoleKey(): Promise<string | null> {
  if (cachedKey) return cachedKey;
  try {
    const envPath = new URL('../../.env', import.meta.url);
    const raw = await readFile(envPath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      if (trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
        cachedKey = trimmed.split('=').slice(1).join('=').replace(/(^['"]|['"]$)/g, '').trim();
        return cachedKey;
      }
    }
  } catch (err) {
    console.error('[supabaseAdmin] Failed to read .env:', err);
  }
  return (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim() || null;
}

let adminClient: ReturnType<typeof createClient> | null = null;

export async function getSupabaseAdmin() {
  const key = await loadServiceRoleKey();
  if (!key) return null;
  if (!adminClient) {
    const url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '').trim();
    if (!url) return null;
    adminClient = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
      // @ts-ignore - provide ws transport for Node.js < 22 WebSocket support
      realtime: { transport: ws },
    });
  }
  return adminClient;
}
