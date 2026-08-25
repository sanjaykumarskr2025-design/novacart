// Paste your Supabase project URL and anon/publishable key here.
// Supabase Dashboard → Project Settings → API.
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const SUPABASE_URL="https://evbmqqjmycbvpwtzrxeu.supabase.co";
const SUPABASE_ANON_KEY="sb_publishable_X6eH8X960UlOhLSqTyvdog_MF9xAJ63";
export const supabase=createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
