import { createClient } from '@supabase/supabase-js';

// Replace these strings with your actual Supabase credentials from Settings > API
const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-supabase-anon-key-here';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
