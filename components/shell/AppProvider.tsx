"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ACH, computeMetrics } from "@/lib/metrics";
import { dayInfo } from "@/lib/program";
import { i18n } from "@/lib/i18n";
import { todayKey } from "@/lib/utils/date";
import { Sync, type SyncStatus } from "@/lib/data/sync";
import { cache, type Repo } from "@/lib/data/repo";
import type { Session, State } from "@/lib/types";
import { Ctx, TAB_PATH, type AppCtx, type SheetState, type Tab } from "./context";
import { makeActions } from "./actions";
import { Shell } from "./Shell";
import { Splash } from "./Splash";

interface Props { repo: Repo; scope: string; signOut: (() => void) | null; children: React.ReactNode }

export function AppProvider({ repo, scope, signOut, children }: Props) {
  const [state, setState] = useState<State | null>(null);
  const [entered, setEntered] = useState(false);
  const [sheet, setSheet] = useState<SheetState | null>(null);
  const [wmOpen, setWmOpen] = useState(false);
  const [summary, setSummary] = useState<Session | null>(null);
  const [celebrate, setCelebrate] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState<{ msg: string; kind?: "err" | "ach" } | null>(null);
  const [sync, setSync] = useState<SyncStatus>("ok");
  const stateRef = useRef<State | null>(null);
  const syncRef = useRef<Sync | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const prevPct = useRef<number | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // load
  useEffect(() => {
    const s = new Sync(repo, scope, setSync, (remote) => { stateRef.current = remote; setState(remote); });
    syncRef.current = s;
    let live = true;
    s.init().then((st) => { if (live) { stateRef.current = st; setState(st); } });
    const kick = () => s.flush();
    window.addEventListener("online", kick);
    document.addEventListener("visibilitychange", kick);
    return () => { live = false; s.dispose(); window.removeEventListener("online", kick); document.removeEventListener("visibilitychange", kick); };
  }, [repo, scope]);

  // Splash: a beat of brand on cold start, then straight in. No extra tap.
  useEffect(() => {
    if (!state || entered) return;
    const tm = setTimeout(() => setEntered(true), 700);
    return () => clearTimeout(tm);
  }, [state, entered]);

  const commit = useCallback((next: State) => { stateRef.current = next; setState(next); syncRef.current?.save(next); }, []);
  const update = useCallback((fn: (d: State) => void) => {
    const cur = stateRef.current;
    if (!cur) return;
    const d = structuredClone(cur);
    fn(d);
    commit(d);
  }, [commit]);

  const toast = useCallback((msg: string, kind?: "err" | "ach") => {
    clearTimeout(toastTimer.current);
    setToastMsg({ msg, kind });
    toastTimer.current = setTimeout(() => setToastMsg(null), 2400);
  }, []);
  const open = useCallback<AppCtx["open"]>((type, params) => setSheet({ type, ...params } as unknown as SheetState), []);
  const close = useCallback(() => setSheet(null), []);
  const setTab = useCallback((t: Tab) => { router.push(TAB_PATH[t]); window.scrollTo({ top: 0 }); }, [router]);

  const lang = state?.profile.lang ?? "fr";
  const tf = i18n(lang);
  useEffect(() => { document.documentElement.lang = lang; cache.set("mp:lang", lang); }, [lang]);

  const metrics = useMemo(() => (state ? computeMetrics(state) : null), [state]);

  // day-complete moment + achievement unlocks
  useEffect(() => {
    if (!state || !metrics) return;
    const pct = metrics.today.pct;
    if (prevPct.current != null && prevPct.current < 100 && pct === 100) setCelebrate(dayInfo(state.profile, todayKey()).dayNum);
    prevPct.current = pct;
    const fresh = ACH.filter((a) => a.test(state, metrics)).map((a) => a.id).filter((id) => !state.seenAch.includes(id));
    if (fresh.length) {
      const { t } = i18n(state.profile.lang);
      setTimeout(() => toast(t.ui.unlocked(t.ach[fresh[0]][0]), "ach"), 600);
      update((d) => { d.seenAch = [...new Set([...d.seenAch, ...fresh])]; });
    }
  }, [metrics]); // eslint-disable-line react-hooks/exhaustive-deps

  // The getters read refs lazily, from event handlers only, never during render.
  // eslint-disable-next-line react-hooks/refs
  const actions = useMemo(() => makeActions({
    update, replace: commit, getState: () => stateRef.current!, toast, open, setTab,
    setWorkoutOpen: setWmOpen, setSummary, repo, t: () => i18n(stateRef.current?.profile.lang).t,
  }), [update, commit, toast, open, setTab, repo]);

  if (!state || !metrics || !entered) return <Splash ready={!!state} onEnter={() => setEntered(true)} t={tf.t} />;

  const ctx: AppCtx = { ...tf, state, metrics, update, replace: commit, actions, open, close, toast, setTab, repo, sync, signOut };
  return (
    <Ctx.Provider value={ctx}>
      <Shell pathname={pathname} sheet={sheet} wmOpen={wmOpen} setWmOpen={setWmOpen} summary={summary} setSummary={setSummary}
        celebrate={celebrate} setCelebrate={setCelebrate} toastMsg={toastMsg}>
        {children}
      </Shell>
    </Ctx.Provider>
  );
}
