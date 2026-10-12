"use client";

import { useMemo } from "react";
import { Check, Play } from "lucide-react";
import { PHASES, bestSetOf, buildWorkout, dayInfo, e1rm, lastPerformance, missedThisWeek, targetFor, type PlannedExercise } from "@/lib/program";
import { sessionOn } from "@/lib/metrics";
import { addDays, todayKey, weekStartOf } from "@/lib/utils/date";
import type { Session } from "@/lib/types";
import { useApp } from "@/components/shell/context";
import { SecH, Stat } from "@/components/ui/primitives";

function ExerciseLine({ x, sessions }: { x: PlannedExercise; sessions: Session[] }) {
  const { t, f } = useApp();
  const last = lastPerformance(sessions, x.exId);
  const tgt = targetFor(sessions, x.exId, x.reps);
  return (
    <div className="task" style={{ alignItems: "flex-start" }}>
      <div className="tl">
        <div className="tt">{f.exName(x.exId)}</div>
        <div className="ts">{t.ui.restLine(f.exMuscle(x.exId), f.rest(x.rest))}</div>
        {last && <div className="ts" style={{ marginTop: 3 }}>{t.ui.last(last.sets.map((s) => `${f.w(s.w)}×${s.r}`).join(", "))}<span className="red">{f.target(tgt)}</span></div>}
      </div>
      <div className="d n" style={{ fontSize: 22, fontWeight: 800, whiteSpace: "nowrap" }}>{x.sets} × {x.reps[0]}-{x.reps[1]}</div>
    </div>
  );
}

export function TrainingPage() {
  const { state, actions, open, t, f } = useApp();
  const key = todayKey();
  const info = dayInfo(state.profile, key);
  const sess = sessionOn(state, key);
  const missed = missedThisWeek(state.profile, state.sessions, key);
  const tpl = info.tplId || missed[0] || null;
  const wk = buildWorkout(info, tpl);
  const ws = weekStartOf(key);
  const lifts = useMemo(() => {
    const ids = [...new Set(state.sessions.flatMap((s) => s.exercises.map((x) => x.exId)))];
    return ids.map((id) => ({ id, best: bestSetOf(state.sessions, id)! })).filter((x) => x.best && x.best.w > 0)
      .sort((a, b) => e1rm(b.best.w, b.best.r) - e1rm(a.best.w, a.best.r));
  }, [state.sessions]);

  return (
    <div className="wrap">
      <div className="lbl">{t.ui.weekOf52(info.week)}</div>
      <h1 className="h1 d" style={{ marginTop: 6 }}>{t.ui.training}</h1>
      <div className="two" style={{ marginTop: 22 }}>
        <div>
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: 18 }}>
              {!info.tplId && <div className="chip" style={{ marginBottom: 12 }}>{missed.length ? t.ui.restDayCatch : t.ui.restDay}</div>}
              {wk ? <>
                <div className="lbl">{info.tplId ? t.ui.today : t.ui.catchUp}</div>
                <div className="d up" style={{ fontSize: 54, fontWeight: 900, lineHeight: 0.9, marginTop: 6 }}>{f.tplName(wk.tplId)}</div>
                <div className="mute" style={{ marginTop: 8 }}>{t.tpl[wk.tplId].focus}</div>
                <div className="row" style={{ gap: 24, marginTop: 16 }}>
                  <Stat v={wk.duration} unit="min" k={t.ui.duration} />
                  <Stat v={wk.exercises.length} k={t.ui.exercises} />
                  <Stat v={wk.exercises.reduce((s, x) => s + x.sets, 0)} k={t.ui.setsK} />
                </div>
                <p className="lbl" style={{ marginTop: 14 }}>{wk.note === "deload" ? t.deloadNote : f.phase(wk.note).note}</p>
              </> : <>
                <div className="d up" style={{ fontSize: 54, fontWeight: 900, lineHeight: 0.9 }}>{t.ui.recover}</div>
                <p className="mute" style={{ marginTop: 10 }}>{t.ui.recoverSub}</p>
              </>}
            </div>
            {wk && <div style={{ padding: "0 18px 18px" }}>
              {sess ? <div className="btn ghost" style={{ pointerEvents: "none" }}><Check size={18} />{t.ui.doneTodaySets(sess.sets)}</div>
                : state.active ? <button className="btn" onClick={() => actions.goWorkout(state.active!.date)}>{t.ui.resumeWorkout}</button>
                : <button className="btn" onClick={() => actions.startWorkout(key, tpl)}><Play size={18} fill="#fff" />{t.ui.startWorkout}</button>}
            </div>}
          </div>
          {wk && <div className="sec">
            <SecH title={t.ui.theSession} />
            {wk.exercises.map((x) => <ExerciseLine key={x.exId} x={x} sessions={state.sessions} />)}
          </div>}
        </div>

        <div>
          <SecH title={t.ui.thisWeek} />
          <div className="card" style={{ padding: "4px 16px" }}>
            {[...Array(7)].map((_, i) => {
              const k = addDays(ws, i);
              const inf = dayInfo(state.profile, k);
              const done = sessionOn(state, k);
              const padel = state.activities.some((a) => a.date === k && a.type === "padel");
              const tp = inf.tplId;
              return (
                <button key={k} className="task" style={{ width: "100%", textAlign: "left", minHeight: 52 }} onClick={() => open("day", { key: k })}>
                  <span className="d" style={{ width: 40, fontWeight: 800, color: k === key ? "var(--red)" : "var(--mute)" }}>{t.dow3[i]}</span>
                  <div className="tl"><div className="tt" style={{ textDecoration: "none", color: tp ? "var(--text)" : "var(--dim)" }}>{done ? f.sessName(done) : tp ? f.tplName(tp) : t.ui.rest}</div></div>
                  {(inf.padelPlanned || padel) && <span className={`chip ${padel ? "r" : ""}`}>{t.ui.padel}</span>}
                  {done ? <span className="chk on" style={{ animation: "none" }}><Check size={16} strokeWidth={3} color="#fff" /></span> : <span className="chk" style={{ opacity: tp ? 1 : 0.2 }} />}
                </button>
              );
            })}
          </div>

          <div className="sec">
            <SecH title={t.ui.program12} />
            <div style={{ display: "grid", gridTemplateColumns: "8fr 12fr 12fr 12fr 8fr", gap: 3 }}>
              {PHASES.map((p) => <div key={p.id} style={{ height: 8, background: p.id < info.phase.id ? "var(--red)" : p.id === info.phase.id ? "var(--text)" : "var(--s3)" }} />)}
            </div>
            <div style={{ marginTop: 14 }}>
              {PHASES.map((p) => (
                <div key={p.id} className="task" style={{ opacity: p.id < info.phase.id ? 0.5 : 1, alignItems: "flex-start" }}>
                  <span className="d n" style={{ fontSize: 22, fontWeight: 900, width: 26, color: p.id === info.phase.id ? "var(--red)" : "var(--dim)" }}>{p.id}</span>
                  <div className="tl">
                    <div className="tt">{f.phase(p.id).name} <span className="mute" style={{ fontWeight: 400, fontSize: 13 }}>{t.ui.weeksRange(p.weeks[0], p.weeks[1])}</span></div>
                    <div className="mute" style={{ fontSize: 13 }}>{f.phase(p.id).goal}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sec">
            <SecH title={t.ui.bestLifts} />
            {lifts.length ? <table className="tbl"><tbody>{lifts.slice(0, 12).map((l) => (
              <tr key={l.id}><td>{f.exName(l.id)}</td><td className="n" style={{ textAlign: "right", fontWeight: 700 }}>{f.w(l.best.w)} kg × {l.best.r}</td></tr>
            ))}</tbody></table> : <p className="mute">{t.ui.logbookEmpty}</p>}
          </div>

          <div className="sec">
            <SecH title={t.ui.history} />
            {state.sessions.length ? [...state.sessions].reverse().slice(0, 10).map((s) => (
              <div key={s.id} className="task">
                <div className="tl"><div className="tt">{f.sessName(s)}</div><div className="ts">{t.ui.histLine(f.date(s.date), f.dur(s.endedAt - s.startedAt), s.sets)}</div></div>
                <div style={{ textAlign: "right" }}><div className="d n" style={{ fontSize: 20, fontWeight: 800 }}>{f.num(s.volume)} kg</div>{s.prs > 0 && <div className="lbl red">{t.ui.pr(s.prs)}</div>}</div>
              </div>
            )) : <p className="mute">{t.ui.noSessions}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
