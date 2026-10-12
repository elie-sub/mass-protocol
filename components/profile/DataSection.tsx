"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useApp } from "@/components/shell/context";
import { SecH } from "@/components/ui/primitives";

/** Backup / restore (the V1 "Restore from text" import path), reset, account. */
export function DataSection() {
  const { state, actions, toast, repo, sync, signOut, t } = useApp();
  const [io, setIo] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const status = { ok: t.ui.syncOk, pending: t.ui.syncPending, offline: t.ui.syncOfflineShort }[sync];
  return (
    <div className="sec">
      <SecH title={t.ui.data} right={repo.mode === "supabase" ? <span className={`chip ${sync === "offline" ? "r" : ""}`}>{status}</span> : undefined} />
      <p className="lbl" style={{ marginBottom: 10 }}>{repo.mode === "supabase" ? t.ui.dataNote : t.ui.dataNoteLocal}</p>
      {sync === "offline" && <p className="lbl red" style={{ marginBottom: 10 }}>{t.ui.syncOffline}</p>}
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <button className="btn xs ghost" onClick={() => setIo(JSON.stringify({ ...state, photos: [] }))}>{t.ui.showBackup}</button>
        <button className="btn xs ghost" disabled={!io} onClick={() => { navigator.clipboard.writeText(io).then(() => toast(t.ui.backupCopied), () => toast(t.ui.selectCopy)); }}>{t.ui.copy}</button>
        <button className="btn xs ghost" disabled={!io} onClick={() => {
          try { actions.importState(JSON.parse(io)); toast(t.ui.restored); setIo(""); } catch { toast(t.ui.invalidJson, "err"); }
        }}>{t.ui.restore}</button>
      </div>
      <textarea rows={4} style={{ marginTop: 10, fontSize: 12 }} value={io} onChange={(e) => setIo(e.target.value)} placeholder={t.ui.backupPh} />
      <button className="lbl" style={{ marginTop: 16, textDecoration: "underline", color: confirmReset ? "var(--red)" : undefined }}
        onClick={() => { if (confirmReset) { actions.resetAll(); setConfirmReset(false); } else { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 4000); } }}>
        {confirmReset ? t.ui.tapAgain : t.ui.resetAll}
      </button>
      {repo.mode === "supabase" && <PairDevice />}
      {signOut && (
        <div style={{ marginTop: 22 }}>
          <button className="btn xs ghost" onClick={signOut}>{t.ui.signOut}</button>
        </div>
      )}
    </div>
  );
}

/** Log another device in: type the code its login screen shows. */
function PairDevice() {
  const { toast, t } = useApp();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const go = async () => {
    setBusy(true);
    try {
      const { data } = await supabase().auth.getSession();
      const r = await fetch("/api/auth/pair", {
        method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${data.session?.access_token ?? ""}` },
        body: JSON.stringify({ code: clean }),
      });
      if (r.ok) { toast(t.ui.pairDone); setCode(""); } else toast(t.ui.pairFailed, "err");
    } catch { toast(t.ui.pairFailed, "err"); } finally { setBusy(false); }
  };
  return (
    <div style={{ marginTop: 22 }}>
      <SecH title={t.ui.pairTitle} />
      <p className="lbl" style={{ marginBottom: 10 }}>{t.ui.pairSub}</p>
      <div className="row" style={{ gap: 8 }}>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="XXXX-XXXX" autoCapitalize="characters" autoComplete="off" className="d n" style={{ fontSize: 20, letterSpacing: ".08em" }} />
        <button className="btn sm" disabled={busy || clean.length !== 8} onClick={go}>{t.ui.pairGo}</button>
      </div>
    </div>
  );
}
