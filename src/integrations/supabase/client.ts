
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://lhhxxnbfdrkvjjbzxdjs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoaHh4bmJmZHJrdmpqYnp4ZGpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3OTE0NDMsImV4cCI6MjA1OTM2NzQ0M30.1-WdcaRFaxjvq_dLlQ-XJaOHQANb_jYcTuXP3gpxR5w";

// Create Supabase client with proper authentication settings
export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
