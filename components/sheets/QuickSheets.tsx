"use client";

import { useState } from "react";
import { ACT_RATES, ACT_TYPES } from "@/lib/nutrition";
import { todayKey } from "@/lib/utils/date";
import type { ActType, Energy, Intensity } from "@/lib/types";
import { useApp } from "@/components/shell/context";
import { Field, Opt, Sheet, Stepper } from "@/components/ui/primitives";

export function WeighSheet({ dateKey, onClose }: { dateKey: string; onClose: () => void }) {
  const { state, actions, t, f } = useApp();
  const prev = Object.keys(state.weights).filter((k) => k < dateKey).sort().pop();
  const [v, setV] = useState(String(state.weights[dateKey] ?? (prev ? state.weights[prev] : state.profile.startWeight)));
  const n = Number(v);
  return (
    <Sheet title={dateKey === todayKey() ? t.ui.morningWeigh : t.ui.weightOn(f.short(dateKey))} onClose={onClose} closeLabel={t.ui.close}>
      <p className="mute" style={{ marginBottom: 16 }}>{t.ui.weighSub}</p>
      <Stepper label={t.ui.bodyWeightKg} value={v} step={0.1} onChange={setV} decLabel={t.ui.decrease(t.ui.bodyWeightKg)} incLabel={t.ui.increase(t.ui.bodyWeightKg)} />
      <button className="btn" style={{ marginTop: 16 }} disabled={!(n > 30 && n < 250)} onClick={() => { actions.setWeight(dateKey, +n.toFixed(1)); onClose(); }}>{t.ui.saveWeight}</button>
      {state.weights[dateKey] != null && <button className="lbl" style={{ marginTop: 16, width: "100%", textDecoration: "underline" }} onClick={() => { actions.setWeight(dateKey, null); onClose(); }}>{t.ui.deleteEntry}</button>}
    </Sheet>
  );
}

export function ActivitySheet({ dateKey, preset, onClose }: { dateKey: string; preset?: string; onClose: () => void }) {
  const { actions, t, f } = useApp();
  const [type, setType] = useState<ActType>((preset as ActType) || "padel");
  const [duration, setDuration] = useState("90");
  const [intensity, setIntensity] = useState<Intensity>("medium");
  const d = Number(duration) || 0;
  const est = Math.round((d * ACT_RATES[type][intensity]) / 50) * 50;
  return (
    <Sheet title={t.ui.addActivity} onClose={onClose} closeLabel={t.ui.close}>
      <Field label={t.ui.activity}><Opt value={type} options={ACT_TYPES.map((k) => [k, t.act[k]] as [ActType, string])} onChange={setType} /></Field>
      <div style={{ marginTop: 18 }}>
        <Field label={t.ui.durationMin}><Opt value={duration} options={["60", "90", "120"]} onChange={setDuration} /></Field>
        <input style={{ marginTop: 8 }} inputMode="numeric" value={duration} onChange={(e) => setDuration(e.target.value)} aria-label={t.ui.customDuration} />
      </div>
      <div style={{ marginTop: 18 }}>
        <Field label={t.ui.intensityL}><Opt value={intensity} options={(["low", "medium", "high"] as Intensity[]).map((k) => [k, t.intensity[k]] as [Intensity, string])} onChange={setIntensity} /></Field>
      </div>
      <p className="lbl" style={{ marginTop: 16 }}>{t.ui.addsAbout(f.num(est), est >= 400)}</p>
      <button className="btn" style={{ marginTop: 16 }} disabled={d <= 0} onClick={() => { actions.addActivity({ date: dateKey, type, duration: d, intensity }); onClose(); }}>{t.ui.saveActivity}</button>
    </Sheet>
  );
}

export function CheckinSheet({ dateKey, onClose }: { dateKey: string; onClose: () => void }) {
  const { state, actions, t } = useApp();
  const c = state.days[dateKey]?.checkin;
  const [energy, setEnergy] = useState<Energy>(c?.energy || "Good");
  const [note, setNote] = useState(c?.note || "");
  return (
    <Sheet title={t.ui.dailyCheckin} onClose={onClose} closeLabel={t.ui.close}>
      <Field label={t.ui.energyToday}><Opt value={energy} options={(["Low", "Good", "High"] as Energy[]).map((k) => [k, t.answers[k]] as [Energy, string])} onChange={setEnergy} /></Field>
      <div style={{ marginTop: 18 }}>
        <Field label={t.ui.oneLine}><textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t.ui.oneLinePh} /></Field>
      </div>
      <button className="btn" style={{ marginTop: 18 }} onClick={() => { actions.setCheckin(dateKey, { energy, note: note.trim() }); onClose(); }}>{t.ui.saveCheckin}</button>
    </Sheet>
  );
}
