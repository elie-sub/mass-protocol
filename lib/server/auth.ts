import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** Single-user lock. Empty list = anyone may request a login. */
export function emailAllowed(email: string) {
  const allowed = (process.env.ALLOWED_EMAIL ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return !allowed.length || allowed.includes(email.trim().toLowerCase());
}

export const isNonce = (n: unknown): n is string => typeof n === "string" && /^[a-f0-9]{32,128}$/.test(n);

/** Service-role client. Server only; never import from client components. */
export function adminClient() {
  const url = supabaseUrl(), key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Device pairing codes: 8 unambiguous characters, shown as XXXX-XXXX. Stored hashed, as the handoff nonce. */
export const normCode = (c: unknown) => (typeof c === "string" ? c.toUpperCase().replace(/[^A-Z0-9]/g, "") : "");
export const isCode = (c: string) => /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{8}$/.test(c);
export async function codeNonce(code: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`mp-pair:${code}`));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}
