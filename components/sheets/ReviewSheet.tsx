"use client";

import { useState } from "react";
import { dayInfo } from "@/lib/program";
import { weekStats, weeklySuggestion } from "@/lib/metrics";
import type { ReviewAnswers } from "@/lib/types";
import { useApp } from "@/components/shell/context";
import { Field, Opt, Sheet, Stat } from "@/components/ui/primitives";

export function ReviewSheet({ ws, onClose }: { ws: string; onClose: () => void }) {
  const { state, metrics, actions, t, f } = useApp();
  const st = weekStats(state, metrics, ws);
  const saved = state.checkins[ws];
  const [editing, setEditing] = useState(!saved);
  const [a, setA] = useState<ReviewAnswers>(saved?.answers || { hunger: "Good", energy: "Good", recovery: "Good", workouts: "Yes", notes: "" });
  const sug = weeklySuggestion(st);
  const sugText = t.suggestion[sug.code](sug.kcalAdh);
  const set = (k: keyof ReviewAnswers) => (v: string) => setA({ ...a, [k]: v });
  const opts = (vals: string[]) => vals.map((v) => [v, t.answers[v]] as [string, string]);
  const signed = `${sug.delta > 0 ? "+" : ""}${sug.delta}`;
  return (
    <Sheet title={t.ui.weeklyReview} onClose={onClose} closeLabel={t.ui.close}>
      <div className="lbl">{t.ui.weekOfLine(f.short(ws), dayInfo(state.profile, ws).week)}</div>
      <div className="grid2" style={{ marginTop: 16, rowGap: 22 }}>
        <Stat v={st.wAvg != null ? f.dec(st.wAvg) : "–"} unit="kg" k={t.ui.avgWeight} />
        <Stat v={st.change != null ? f.kg(st.change, true) : "–"} unit="kg" k={t.ui.changeVsLast} red={(st.change ?? 0) > 0} />
        <Stat v={`${st.kcalAdh}%`} k={t.ui.kcalDays} />
        <Stat v={`${st.pAdh}%`} k={t.ui.protDays} />
        <Stat v={`${st.gym}/${st.planned}`} k={t.ui.gymSessions} />
        <Stat v={st.padel} k={t.ui.padelSessions} />
        <Stat v={`${st.avgScore}%`} k={t.ui.avgDaily} red />
      </div>
      {editing ? <>
        <div style={{ display: "grid", gap: 18, marginTop: 26 }}>
          <Field label={t.ui.qHunger}><Opt value={a.hunger} options={opts(["Low", "Good", "High"])} onChange={set("hunger")} /></Field>
          <Field label={t.ui.qEnergy}><Opt value={a.energy} options={opts(["Low", "Good", "High"])} onChange={set("energy")} /></Field>
          <Field label={t.ui.qRecovery}><Opt value={a.recovery} options={opts(["Poor", "Good", "Excellent"])} onChange={set("recovery")} /></Field>
          <Field label={t.ui.qWorkouts}><Opt value={a.workouts} options={opts(["Yes", "Mostly", "No"])} onChange={set("workouts")} /></Field>
          <Field label={t.ui.notes}><textarea rows={3} value={a.notes} onChange={(e) => set("notes")(e.target.value)} placeholder={t.ui.reviewNotesPh} /></Field>
        </div>
        <button className="btn" style={{ marginTop: 20 }} onClick={() => {
          actions.submitReview(ws, { answers: a, stats: st, suggestion: sugText, suggestionCode: sug.code });
          setEditing(false);
        }}>{t.ui.submitWeek}</button>
      </> : <>
        <div className="card" style={{ marginTop: 24, borderColor: "rgba(232,41,28,.4)" }}>
          <div className="lbl">{t.ui.synthesis}</div>
          <p style={{ marginTop: 8, fontSize: 16, fontWeight: 600 }}>{sugText}</p>
          {a.hunger === "Low" && st.kcalAdh < 70 && <p className="mute" style={{ marginTop: 8, fontSize: 14 }}>{t.ui.lowHungerTip}</p>}
          {a.recovery === "Poor" && <p className="mute" style={{ marginTop: 8, fontSize: 14 }}>{t.ui.poorRecoveryTip}</p>}
          {sug.delta !== 0 && (saved?.applied
            ? <p className="lbl" style={{ marginTop: 12 }}>{t.ui.applied(signed)}</p>
            : <button className="btn sm" style={{ marginTop: 14, width: "100%" }} onClick={() => actions.applyAdjust(ws, sug.delta)}>{t.ui.apply(signed)}</button>)}
        </div>
        <p className="mute" style={{ marginTop: 14, fontSize: 14 }}>
          {t.ui.answersLine(f.answer(a.hunger).toLowerCase(), f.answer(a.energy).toLowerCase(), f.answer(a.recovery).toLowerCase(), f.answer(a.workouts).toLowerCase())}{a.notes ? ` ${a.notes}` : ""}
        </p>
        <button className="btn ghost sm" style={{ marginTop: 16, width: "100%" }} onClick={() => setEditing(true)}>{t.ui.editAnswers}</button>
      </>}
    </Sheet>
  );
}
