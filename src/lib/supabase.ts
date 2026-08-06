import { createClient, type User, type Session } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export function setSessionCookie(session: Session | null) {
  if (!session) {
    document.cookie = 'sb-access-token=; Path=/; Max-Age=0; SameSite=Lax';
    document.cookie = 'sb-refresh-token=; Path=/; Max-Age=0; SameSite=Lax';
    return;
  }
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `sb-access-token=${session.access_token}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  document.cookie = `sb-refresh-token=${session.refresh_token}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  console.log('[cookie] set sb-access-token, length:', session.access_token.length);
}

export function getSessionCookie(): { access_token?: string; refresh_token?: string } {
  const cookies = document.cookie.split('; ');
  const result: { access_token?: string; refresh_token?: string } = {};
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.split('=');
    if (name === 'sb-access-token') result.access_token = rest.join('=');
    if (name === 'sb-refresh-token') result.refresh_token = rest.join('=');
  }
  console.log('[cookie] getSessionCookie:', result.access_token ? `access_token length=${result.access_token.length}` : 'no access_token');
  return result;
}

export type PrayerCategory =
  | 'anxiety'
  | 'grief'
  | 'finances'
  | 'relationships'
  | 'health'
  | 'guidance'
  | 'gratitude'
  | 'other';

export type PrayerStatus = 'pending' | 'praying' | 'prayed';

export interface PrayerRequest {
  id: string;
  name: string | null;
  category: PrayerCategory;
  body: string;
  status: PrayerStatus;
  prayed_note: string | null;
  created_at: string;
  prayed_at: string | null;
  user_id: string | null;
}

export interface Testimony {
  id: string;
  author_name: string | null;
  title: string;
  body: string;
  approved: boolean;
  created_at: string;
}

export type AppointmentStatus = 'pending' | 'scheduled' | 'completed';

export interface Appointment {
  id: string;
  name: string | null;
  contact: string;
  reason: string;
  status: AppointmentStatus;
  created_at: string;
}

export interface PriestessPost {
  id: string;
  title: string;
  body: string;
  created_at: string;
}

export const PRAYER_CATEGORIES: { value: PrayerCategory; label: string; blurb: string }[] = [
  { value: 'anxiety', label: 'Anxiety & Fear', blurb: 'When worry feels heavy' },
  { value: 'grief', label: 'Grief & Loss', blurb: 'Mourning what was loved' },
  { value: 'finances', label: 'Financial Stress', blurb: 'Provision and pressure' },
  { value: 'relationships', label: 'Relationships', blurb: 'Conflict, family, love' },
  { value: 'health', label: 'Health & Healing', blurb: 'Body, mind, recovery' },
  { value: 'guidance', label: 'Guidance & Direction', blurb: 'Seeking a path forward' },
  { value: 'gratitude', label: 'Gratitude', blurb: 'Thanksgiving and joy' },
  { value: 'other', label: 'Something Else', blurb: 'Whatever is on your heart' },
];
