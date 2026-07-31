import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
