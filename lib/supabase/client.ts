import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** Supabase is optional: without env vars the app runs on local storage only. */
export const supabaseEnabled = Boolean(url && key);

let client: SupabaseClient | null = null;
export function supabase(): SupabaseClient {
  if (!supabaseEnabled) throw new Error("Supabase is not configured");
  // Implicit flow: the magic link lands with tokens in the URL hash, and the 6-digit code works inside the
  // installed iPhone app, which does not share storage with Safari.
  return (client ??= createClient(url!, key!, { auth: { flowType: "implicit", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }));
}

export const PHOTO_BUCKET = "progress-photos";
