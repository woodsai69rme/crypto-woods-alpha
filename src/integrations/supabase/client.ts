// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://uexcmvwiqsungjmftwof.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVleGNtdndpcXN1bmdqbWZ0d29mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NDU0MjcsImV4cCI6MjA2MzMyMTQyN30.sRHzoTErvmve1gSXTrtu6O0ox4AIgTjHBY0zSJ7zkBo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});