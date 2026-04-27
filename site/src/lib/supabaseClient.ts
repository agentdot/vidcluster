import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (import.meta.env.DEV && (!supabaseUrl || !supabaseAnonKey)) {
  throw new Error(
    "Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getSiteUrl() {
  return (import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin).replace(/\/$/, "");
}
