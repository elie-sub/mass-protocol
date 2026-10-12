import { createClient } from "@supabase/supabase-js";
import { adminClient, codeNonce, emailAllowed, isCode, normCode, supabaseAnonKey, supabaseUrl } from "@/lib/server/auth";

/**
 * Connect another device without email: a signed-in device posts the code the new device shows.
 * The server mints a fresh, independent session for the same user (no email sent, no shared refresh token)
 * and parks it in auth_handoffs, where the new device picks it up.
 */
export async function POST(req: Request) {
  const admin = adminClient(), url = supabaseUrl(), anon = supabaseAnonKey();
  if (!admin || !url || !anon) return Response.json({ error: "not_configured" }, { status: 503 });
  const token = req.headers.get("authorization")?.replace(/^Bearer /, "");
  const { data: who } = token ? await admin.auth.getUser(token) : { data: { user: null } };
  const email = who.user?.email;
  if (!email || !emailAllowed(email)) return Response.json({ error: "unauthorized" }, { status: 401 });

  const code = normCode((await req.json().catch(() => ({})))?.code);
  if (!isCode(code)) return Response.json({ error: "bad_code" }, { status: 400 });

  const link = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const hash = link.data?.properties?.hashed_token;
  if (link.error || !hash) return Response.json({ error: "mint_failed" }, { status: 500 });
  const sb = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await sb.auth.verifyOtp({ token_hash: hash, type: "email" });
  if (error || !data.session) return Response.json({ error: "mint_failed" }, { status: 500 });

  const ins = await admin.from("auth_handoffs").upsert({
    nonce: await codeNonce(code), access_token: data.session.access_token, refresh_token: data.session.refresh_token,
    created_at: new Date().toISOString(),
  });
  if (ins.error) return Response.json({ error: "store_failed" }, { status: 500 });
  return Response.json({ ok: true });
}
