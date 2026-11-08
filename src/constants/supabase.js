import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mjjiynfmivisqzjaslhr.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_475YyQJs4KawMsQKiLMlsw_LCjX-Cf_';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: false,
    detectSessionInUrl: false,
    persistSession: false,
  },
});
