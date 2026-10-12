import { adminClient, codeNonce, emailAllowed, isCode, isNonce, normCode } from "@/lib/server/auth";

/*
 * Login relay for the installed iPhone app, whose storage is separate from Safari's.
 * POST (from Safari, right after the magic link signed it in): park the session under the app's nonce.
 * GET  (polled by the app): hand the session over once, then delete it. Entries expire after 15 minutes.
 *      `?n=` is a magic-link nonce, `?c=` a device pairing code (see /api/auth/pair).
 */
const TTL_MS = 15 * 60 * 1000;

export async function POST(req: Request) {
  const admin = adminClient();
  if (!admin) return Response.json({ error: "not_configured" }, { status: 503 });
  const b = await req.json().catch(() => ({}));
  if (!isNonce(b?.nonce) || typeof b?.access_token !== "string" || typeof b?.refresh_token !== "string") {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }
  const { data, error } = await admin.auth.getUser(b.access_token);
  if (error || !data.user?.email || !emailAllowed(data.user.email)) return Response.json({ error: "unauthorized" }, { status: 401 });
  await admin.from("auth_handoffs").delete().lt("created_at", new Date(Date.now() - TTL_MS).toISOString());
  const ins = await admin.from("auth_handoffs").upsert({ nonce: b.nonce, access_token: b.access_token, refresh_token: b.refresh_token, created_at: new Date().toISOString() });
  if (ins.error) return Response.json({ error: "store_failed" }, { status: 500 });
  return Response.json({ ok: true });
}

export async function GET(req: Request) {
  const admin = adminClient();
  if (!admin) return Response.json({ error: "not_configured" }, { status: 503 });
  const q = new URL(req.url).searchParams;
  const code = normCode(q.get("c"));
  const nonce = code && isCode(code) ? await codeNonce(code) : q.get("n");
  if (!isNonce(nonce)) return Response.json({ error: "bad_request" }, { status: 400 });
  const { data } = await admin.from("auth_handoffs").delete().eq("nonce", nonce).select().maybeSingle();
  if (!data || Date.now() - new Date(data.created_at).getTime() > TTL_MS) return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
  return Response.json({ access_token: data.access_token, refresh_token: data.refresh_token }, { headers: { "cache-control": "no-store" } });
}
