"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseEnabled } from "@/lib/supabase/client";
import { supabaseRepo } from "@/lib/data/supabase";
import { localRepo } from "@/lib/data/local";
import { cache } from "@/lib/data/repo";
import { DICTS } from "@/lib/i18n";
import type { Lang } from "@/lib/types";
import { AppProvider } from "./AppProvider";
import { Splash } from "./Splash";
import { HandedOff, Login, PENDING_KEY } from "./Login";

const noop = () => () => {};

/** Picks the persistence backend: Supabase (with login) when configured, device storage otherwise. */
export function ClientApp({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    // The installed iPhone app stays in memory between launches: reload when a newer deployment is live.
    // Safe at any time, state is mirrored to the device synchronously.
    const check = () => {
      if (document.visibilityState !== "visible") return;
      fetch("/api/version", { cache: "no-store" }).then((r) => r.json())
        .then(({ build }) => { if (build && build !== process.env.NEXT_PUBLIC_BUILD_ID) window.location.reload(); })
        .catch(() => {});
    };
    check();
    document.addEventListener("visibilitychange", check);
    return () => document.removeEventListener("visibilitychange", check);
  }, []);
  if (!supabaseEnabled) return <AppProvider repo={localRepo} scope="local" signOut={null}>{children}</AppProvider>;
  return <SupabaseGate>{children}</SupabaseGate>;
}

/** `?handoff=` from a magic link, read once before anything else touches auth. */
const INITIAL_HANDOFF = typeof window !== "undefined" ? new URL(window.location.href).searchParams.get("handoff") : null;
let relay: Promise<boolean> | null = null;

/**
 * Opened in a browser that did not start this login (Safari vs the installed iPhone app): pass the session on to
 * the app and step aside, without ever rendering the app here (it would seed the account with this browser's data).
 */
function relaySession(): Promise<boolean> {
  return (relay ??= (async () => {
    const sb = supabase();
    const url = new URL(window.location.href);
    url.searchParams.delete("handoff");
    const { data } = await sb.auth.getSession(); // waits for the tokens in the URL hash to be processed
    window.history.replaceState(null, "", url.pathname + url.search);
    const mine = cache.get<string>(PENDING_KEY) === INITIAL_HANDOFF;
    cache.del(PENDING_KEY);
    if (!data.session || mine) return false;
    const r = await fetch("/api/auth/handoff", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ nonce: INITIAL_HANDOFF, access_token: data.session.access_token, refresh_token: data.session.refresh_token }),
    }).catch(() => null);
    if (!r?.ok) return false;
    // Forget the session here without signOut(): that would revoke it server-side, and a refresh would rotate
    // the refresh token the app now owns.
    sb.auth.stopAutoRefresh();
    Object.keys(localStorage).filter((k) => k.startsWith("sb-") && k.endsWith("-auth-token")).forEach((k) => localStorage.removeItem(k));
    return true;
  })());
}

function SupabaseGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [handedOff, setHandedOff] = useState(false);
  const lang = useSyncExternalStore(noop, () => cache.get<Lang>("mp:lang") ?? "fr", () => "fr" as Lang);
  useEffect(() => {
    const sb = supabase();
    let live = true;
    let unsub = () => {};
    (async () => {
      if (INITIAL_HANDOFF && (await relaySession())) { if (live) setHandedOff(true); return; }
      const { data } = await sb.auth.getSession();
      if (!live) return;
      setSession(data.session);
      const sub = sb.auth.onAuthStateChange((_e, s) => { if (live) setSession(s); });
      unsub = () => sub.data.subscription.unsubscribe();
    })();
    return () => { live = false; unsub(); };
  }, []);
  const userId = session?.user.id;
  const repo = useMemo(() => (userId ? supabaseRepo(supabase(), userId) : null), [userId]);
  const t = DICTS[lang];
  if (handedOff) return <HandedOff t={t} />;
  if (session === undefined) return <Splash ready={false} t={t} />;
  if (!session || !repo || !userId) return <Login t={t} />;
  return <AppProvider repo={repo} scope={userId} signOut={() => { supabase().auth.signOut(); }}>{children}</AppProvider>;
}
