import { createClient } from "@supabase/supabase-js";
import { emailAllowed, isNonce, supabaseAnonKey, supabaseUrl } from "@/lib/server/auth";

/**
 * Sends the magic link. Server-side so the single-user allow list (ALLOWED_EMAIL) is enforced before Supabase
 * creates an account. `handoff` is the installed app's one-time nonce, carried in the link (see /api/auth/handoff).
 */
export async function POST(req: Request) {
  const url = supabaseUrl(), key = supabaseAnonKey();
  if (!url || !key) return Response.json({ error: "not_configured" }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: "invalid_email" }, { status: 400 });
  if (!emailAllowed(email)) return Response.json({ error: "not_allowed" }, { status: 403 });

  const redirect = new URL("/", req.url);
  if (isNonce(body?.handoff)) redirect.searchParams.set("handoff", body.handoff);
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, flowType: "implicit" } });
  const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirect.toString(), shouldCreateUser: true } });
  if (error) return Response.json({ error: error.message }, { status: error.status ?? 400 });
  return Response.json({ ok: true });
}
