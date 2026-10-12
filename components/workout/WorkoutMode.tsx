"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeftRight, Check, ChevronLeft, ChevronRight, Minus, Plus, SkipForward, Timer, X } from "lucide-react";
import { EX, bestSetOf, lastPerformance, targetFor } from "@/lib/program";
import { clamp } from "@/lib/utils/date";
import type { ActiveWorkout, State } from "@/lib/types";
import { useApp } from "@/components/shell/context";
import { Sheet, Stepper } from "@/components/ui/primitives";

type Ex = ActiveWorkout["exercises"][number];

export function WorkoutMode({ onClose }: { onClose: () => void }) {
  const { state, update, actions, t, f } = useApp();
  const a = state.active!;
  const [now, setNow] = useState(() => Date.now());
  const [swap, setSwap] = useState(false);
  const [confirm, setConfirm] = useState(false);
  useEffect(() => { const tm = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(tm); }, []);
  const restLeft = a.restEnd ? Math.ceil((a.restEnd - now) / 1000) : 0;
  const prevRest = useRef(restLeft);
  useEffect(() => {
    if (prevRest.current > 0 && restLeft <= 0) { try { navigator.vibrate?.([180, 90, 180]); } catch { /* unsupported */ } }
    prevRest.current = restLeft;
  }, [restLeft]);

  const ex = a.exercises[a.idx];
  const meta = EX[ex.exId];
  const last = lastPerformance(state.sessions, ex.exId);
  const tgt = targetFor(state.sessions, ex.exId, ex.reps);
  const best = bestSetOf(state.sessions, ex.exId);
  const cur = ex.sets.findIndex((s) => !s.done);
  const allDone = a.exercises.every((x) => x.sets.every((s) => s.done));
  const doneSets = a.exercises.reduce((s, x) => s + x.sets.filter((y) => y.done).length, 0);

  const mut = (fn: (A: ActiveWorkout, X: Ex) => void) => update((d: State) => fn(d.active!, d.active!.exercises[d.active!.idx]));
  const setVal = (j: number, k: "w" | "r", v: string) => mut((A, X) => { X.sets[j][k] = v; });
  const saveSet = (j: number) => mut((A, X) => {
    const s = X.sets[j];
    s.w = Number(s.w) || 0; s.r = Number(s.r) || 0; s.done = true;
    const n = X.sets[j + 1];
    if (n && !n.done) { if (n.w === "" || n.w == null) n.w = String(s.w); if (n.r === "" || n.r == null) n.r = String(s.r); }
    A.restEnd = Date.now() + X.rest * 1000;
    if (j === X.sets.length - 1 && A.idx === A.exercises.length - 1) A.restEnd = null;
  });
  const goto = (i: number) => update((d) => { d.active!.idx = clamp(i, 0, d.active!.exercises.length - 1); });
  const swapTo = (id: string) => {
    const tg = targetFor(state.sessions, id, ex.reps);
    mut((A, X) => { X.exId = id; X.sets = X.sets.map((s) => (s.done ? s : { w: tg.w != null ? String(tg.w) : "", r: String(tg.r), done: false })); });
    setSwap(false);
  };
  const restBtn = { background: "rgba(0,0,0,.2)" };

  return (
    <div className="wm mp">
      <div className="wm-in">
        <div className="between" style={{ padding: "12px 0", position: "sticky", top: 0, background: "var(--bg)", zIndex: 3 }}>
          <button className="ib" onClick={onClose} aria-label={t.ui.minimize}><X size={22} /></button>
          <div className="d up" style={{ fontWeight: 800, fontSize: 17, letterSpacing: ".08em" }}>{t.ui.exerciseOf(a.idx + 1, a.exercises.length)}</div>
          <div className="d n" style={{ fontWeight: 800, fontSize: 19, width: 64, textAlign: "right" }}>{f.clock(Math.floor((now - a.startedAt) / 1000))}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${a.exercises.length},1fr)`, gap: 3 }}>
          {a.exercises.map((x, i) => (
            <button key={i} onClick={() => goto(i)} aria-label={t.ui.gotoEx(i + 1)} style={{ height: 22, display: "flex", alignItems: "center" }}>
              <span style={{ display: "block", width: "100%", height: 4, background: x.sets.every((s) => s.done) ? "var(--red)" : i === a.idx ? "var(--text)" : "var(--s3)" }} />
            </button>
          ))}
        </div>

        {restLeft > 0 && (
          <div className="rest" style={{ marginTop: 12, position: "sticky", top: 62, zIndex: 3 }}>
            <div className="row" style={{ gap: 10 }}><Timer size={20} /><span className="d n" style={{ fontSize: 34, fontWeight: 900, lineHeight: 1 }}>{f.clock(restLeft)}</span><span style={{ fontWeight: 600, fontSize: 13 }}>{t.ui.rest}</span></div>
            <div className="row" style={{ gap: 4 }}>
              <button className="btn xs" style={restBtn} onClick={() => update((d) => { d.active!.restEnd! -= 15000; })}>-15</button>
              <button className="btn xs" style={restBtn} onClick={() => update((d) => { d.active!.restEnd! += 15000; })}>+15</button>
              <button className="btn xs" style={restBtn} onClick={() => update((d) => { d.active!.restEnd = null; })} aria-label={t.ui.skipRest}><SkipForward size={16} /></button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 22 }}>
          <div className="lbl">{f.exMuscle(ex.exId)}</div>
          <h1 className="d up" style={{ fontSize: "clamp(40px, 11vw, 60px)", fontWeight: 900, lineHeight: 0.9, marginTop: 6 }}>{f.exName(ex.exId)}</h1>
          <div className="row" style={{ marginTop: 14, gap: 8, flexWrap: "wrap" }}>
            <span className="chip r">{t.ui.targetChip(ex.sets.length, ex.reps[0], ex.reps[1])}</span>
            <span className="chip">{t.ui.restChip(f.rest(ex.rest))}</span>
            <button className="chip" onClick={() => setSwap(true)}><ArrowLeftRight size={13} />{t.ui.swapExercise}</button>
          </div>
        </div>

        <div className="grid2" style={{ marginTop: 18 }}>
          <div className="card" style={{ padding: 14 }}>
            <div className="lbl">{t.ui.lastTime}</div>
            {last ? last.sets.map((s, i) => <div key={i} className="d n" style={{ fontSize: 20, fontWeight: 800, marginTop: i ? 0 : 6 }}>{f.w(s.w)} kg × {s.r}</div>)
              : <div className="mute" style={{ marginTop: 6, fontSize: 14 }}>{t.ui.noHistory}</div>}
            {best && <div className="lbl" style={{ marginTop: 8 }}>{t.ui.best(f.w(best.w), best.r)}</div>}
          </div>
          <div className="card" style={{ padding: 14, borderColor: "rgba(232,41,28,.4)" }}>
            <div className="lbl">{t.ui.targetToday}</div>
            <div className="d" style={{ fontSize: 22, fontWeight: 800, marginTop: 6, lineHeight: 1.1 }}>{f.target(tgt)}</div>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          {ex.sets.map((s, j) => (
            j === cur ? (
              <div key={j} style={{ padding: "16px 0", borderBottom: "1px solid var(--line)" }}>
                <div className="d up" style={{ fontWeight: 800, fontSize: 18, marginBottom: 10 }}>{t.ui.setN(j + 1)}</div>
                <div className="row" style={{ gap: 10 }}>
                  <Stepper label={t.ui.weightKg} value={s.w} step={meta.inc} onChange={(v) => setVal(j, "w", v)} decLabel={t.ui.decrease(t.ui.weightKg)} incLabel={t.ui.increase(t.ui.weightKg)} />
                  <Stepper label={t.ui.reps} value={s.r} step={1} onChange={(v) => setVal(j, "r", v)} decLabel={t.ui.decrease(t.ui.reps)} incLabel={t.ui.increase(t.ui.reps)} />
                </div>
                <button className="btn" style={{ marginTop: 12 }} disabled={s.r === "" || Number(s.r) <= 0} onClick={() => saveSet(j)}><Check size={20} strokeWidth={3} />{t.ui.saveSet}</button>
              </div>
            ) : (
              <div key={j} className="setrow" style={{ opacity: s.done ? 1 : 0.4 }}>
                <span className={`chk ${s.done ? "on" : ""}`} style={{ animation: s.done ? undefined : "none" }}>{s.done && <Check size={16} strokeWidth={3} color="#fff" />}</span>
                <span className="d up" style={{ fontWeight: 800, width: 64 }}>{t.ui.setN(j + 1)}</span>
                <span className="d n" style={{ flex: 1, fontSize: 22, fontWeight: 800 }}>{s.done ? `${f.w(Number(s.w))} kg × ${s.r}` : `${s.w || "–"} kg × ${ex.reps[0]}-${ex.reps[1]}`}</span>
                {s.done && <button className="chip" onClick={() => mut((A, X) => { X.sets[j].done = false; })}>{t.ui.edit}</button>}
              </div>
            )
          ))}
          <div className="row" style={{ marginTop: 12, gap: 8 }}>
            <button className="chip" onClick={() => mut((A, X) => { const l = X.sets[X.sets.length - 1]; X.sets.push({ w: l ? String(l.w) : "", r: "", done: false }); })}><Plus size={13} />{t.ui.addSet}</button>
            {ex.sets.length > 1 && !ex.sets[ex.sets.length - 1].done && <button className="chip" onClick={() => mut((A, X) => { X.sets.pop(); })}><Minus size={13} />{t.ui.removeSet}</button>}
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 28 }} />
        <div className="row" style={{ gap: 10, paddingTop: 12 }}>
          <button className="btn ghost" style={{ width: 64, padding: 0 }} disabled={a.idx === 0} onClick={() => goto(a.idx - 1)} aria-label={t.ui.prevEx}><ChevronLeft size={22} /></button>
          {a.idx < a.exercises.length - 1
            ? <button className={`btn ${cur === -1 ? "" : "ghost"}`} onClick={() => goto(a.idx + 1)}>{t.ui.nextEx}<ChevronRight size={20} /></button>
            : <button className={`btn ${allDone ? "" : "ghost"}`} onClick={() => (allDone ? actions.finishWorkout() : setConfirm(true))}>{t.ui.finishWorkout}</button>}
        </div>
        {a.idx < a.exercises.length - 1 && <button className="lbl" style={{ marginTop: 14, alignSelf: "center", textDecoration: "underline" }} onClick={() => setConfirm(true)}>{t.ui.finishNow}</button>}
      </div>

      {swap && (
        <Sheet title={t.ui.swapExercise} onClose={() => setSwap(false)} closeLabel={t.ui.close}>
          <p className="mute" style={{ marginBottom: 12 }}>{t.ui.swapSub}</p>
          {(meta.alt || []).map((id) => (
            <button key={id} className="task" style={{ width: "100%", textAlign: "left" }} onClick={() => swapTo(id)}>
              <div className="tl"><div className="tt">{f.exName(id)}</div><div className="ts">{f.exMuscle(id)}</div></div><ChevronRight size={18} />
            </button>
          ))}
        </Sheet>
      )}
      {confirm && (
        <Sheet title={t.ui.finishQ} onClose={() => setConfirm(false)} closeLabel={t.ui.close}>
          <p className="mute">{t.ui.setsLogged(doneSets)}</p>
          <button className="btn" style={{ marginTop: 18 }} disabled={!doneSets} onClick={() => { setConfirm(false); actions.finishWorkout(); }}>{t.ui.finishSave}</button>
          <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => setConfirm(false)}>{t.ui.keepTraining}</button>
          <button className="lbl" style={{ marginTop: 18, width: "100%", textDecoration: "underline" }} onClick={() => { setConfirm(false); actions.discardWorkout(); }}>{t.ui.discard}</button>
        </Sheet>
      )}
    </div>
  );
}
