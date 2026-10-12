"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { cache } from "@/lib/data/repo";
import type { Dict } from "@/lib/i18n";
import { Splash } from "./Splash";

export const PENDING_KEY = "mp:pendingLogin";
const PAIR_KEY = "mp:pairCode";
const ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const newCode = () => Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => ALPHA[b % ALPHA.length]).join("");
const newNonce = () => Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) => b.toString(16).padStart(2, "0")).join("");

/**
 * ENTER screen: email → magic link. The installed iPhone app cannot see the session the link creates in Safari,
 * so it sends a one-time nonce with the request and polls /api/auth/handoff until Safari relays the session.
 */
export function Login({ t }: { t: Dict }) {
  const [email, setEmail] = useState("");
  // Resume waiting if iOS reloaded the app while the user was in Mail.
  const [nonce, setNonce] = useState<string | null>(() => cache.get<string>(PENDING_KEY));
  // Pairing code: a signed-in device types it in Profile to log this one in, no email needed.
  const [pair] = useState(() => { const c = cache.get<string>(PAIR_KEY) ?? newCode(); cache.set(PAIR_KEY, c); return c; });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let live = true;
    const take = async (q: string) => {
      const r = await fetch(`/api/auth/handoff?${q}`, { cache: "no-store" });
      if (r.status !== 200) return false;
      const { error } = await supabase().auth.setSession(await r.json());
      cache.del(PENDING_KEY);
      cache.del(PAIR_KEY);
      if (error && live) { setErr(t.ui.authError); setNonce(null); }
      return true;
    };
    const tick = async () => {
      try {
        if (await take(`c=${pair}`)) return;
        if (nonce && (await take(`n=${nonce}`))) return;
      } catch { /* offline: keep waiting */ }
      if (live) tm = setTimeout(tick, 2500);
    };
    let tm = setTimeout(tick, 2500);
    return () => { live = false; clearTimeout(tm); };
  }, [nonce, pair, t]);

  const send = async () => {
    setBusy(true); setErr("");
    const n = newNonce();
    try {
      const r = await fetch("/api/auth/otp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, handoff: n }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) setErr(j.error === "not_allowed" ? t.ui.notAllowed : j.error || t.ui.authError);
      else { cache.set(PENDING_KEY, n); setNonce(n); }
    } catch { setErr(t.ui.authError); } finally { setBusy(false); }
  };

  return (
    <Splash ready t={t}>
      <form style={{ marginTop: 36, maxWidth: 320, display: "grid", gap: 10 }} onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => { e.preventDefault(); send(); }}>
        {!nonce ? <>
          <input type="email" autoComplete="email" inputMode="email" placeholder={t.ui.email} value={email} onChange={(e) => setEmail(e.target.value)} required />
          {err && <p className="lbl red">{err}</p>}
          <button className="btn" type="submit" disabled={busy || !email}>{busy ? t.ui.sending : t.ui.sendCode}</button>
        </> : <>
          <p className="lbl" style={{ color: "var(--text)", fontSize: 14 }}>{t.ui.linkSent}</p>
          <p className="lbl">{t.ui.waiting}</p>
          {err && <p className="lbl red">{err}</p>}
          <button type="button" className="lbl" style={{ textDecoration: "underline", justifySelf: "start" }} onClick={() => { setNonce(null); cache.del(PENDING_KEY); }}>{t.ui.otherEmail}</button>
        </>}
        <div style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
          <p className="lbl">{t.ui.pairHint}</p>
          <div className="d n" style={{ fontSize: 34, fontWeight: 900, letterSpacing: ".08em", marginTop: 6 }}>{pair.slice(0, 4)}-{pair.slice(4)}</div>
        </div>
      </form>
    </Splash>
  );
}

/** Shown in Safari after it relayed the session to the installed app. */
export function HandedOff({ t }: { t: Dict }) {
  return (
    <Splash ready t={t}>
      <p className="d up" style={{ marginTop: 36, fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{t.ui.handedOffTitle}</p>
      <p className="mute" style={{ marginTop: 10, maxWidth: 320 }}>{t.ui.handedOff}</p>
    </Splash>
  );
}
