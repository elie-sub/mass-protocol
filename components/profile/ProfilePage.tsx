"use client";

import { useState } from "react";
import { LOCK } from "@/lib/metrics";
import { baseTargets, weightAt } from "@/lib/nutrition";
import { addDays, todayKey } from "@/lib/utils/date";
import type { Lang, Profile } from "@/lib/types";
import { useApp } from "@/components/shell/context";
import { Field, Opt, SecH, Stat } from "@/components/ui/primitives";
import { DataSection } from "./DataSection";

export function ProfilePage() {
  const { state, metrics, actions, toast, t, f } = useApp();
  const [p, setP] = useState<Profile>(state.profile);
  const [base, setBase] = useState(state.profile);
  // Pick up profile changes made elsewhere (weekly review adjustments, restore, language) without losing unsaved edits.
  if (base !== state.profile) {
    const changed = (Object.keys(state.profile) as (keyof Profile)[]).filter((k) => JSON.stringify(base[k]) !== JSON.stringify(state.profile[k]));
    setBase(state.profile);
    setP({ ...p, ...Object.fromEntries(changed.map((k) => [k, state.profile[k]])) });
  }
  const dirty = JSON.stringify(p) !== JSON.stringify(state.profile);
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setP({ ...p, [k]: v });
  const num = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) => setP({ ...p, [k]: e.target.value === "" ? "" : Number(e.target.value.replace(",", ".")) });
  const preview = baseTargets({ ...p, manual: { ...p.manual } }, weightAt(state, todayKey()));
  const end = addDays(state.profile.startDate, 364);
  const valid = p.name && p.age > 0 && p.heightCm > 100 && p.startWeight > 30 && p.goalWeight > 30 && /^\d{4}-\d{2}-\d{2}$/.test(p.startDate);
  const setLang = (lang: Lang) => actions.updateProfile({ lang });

  return (
    <div className="wrap">
      <div className="lbl">{state.profile.name}</div>
      <h1 className="h1 d" style={{ marginTop: 6 }}>{t.ui.profile}</h1>
      <div className="two" style={{ marginTop: 22 }}>
        <div>
          <div className="card" style={{ padding: 22 }}>
            <div className="lbl">{t.ui.mission12}</div>
            <div className="d up" style={{ fontSize: 46, fontWeight: 900, lineHeight: 0.9, marginTop: 8 }}>{t.ui.massive}<br />{t.ui.aesthetic}</div>
            <div className="grid2" style={{ marginTop: 22, rowGap: 20 }}>
              <Stat v={f.dec(state.profile.startWeight)} unit="kg" k={t.ui.startingWeight} />
              <Stat v={f.dec(state.profile.goalWeight)} unit="kg" k={t.ui.goalWeight} />
              <Stat v={`${metrics.list.length}/365`} k={t.ui.daysCompleted} red />
              <Stat v={metrics.list.filter((r) => r.pct >= LOCK).length} k={t.ui.days80} />
            </div>
            <p className="lbl" style={{ marginTop: 18 }}>{t.ui.rangeTo(f.date(state.profile.startDate), f.date(end))}</p>
          </div>

          <div className="sec">
            <SecH title={t.ui.bodyMission} />
            <div className="grid2">
              <Field label={t.ui.name}><input value={p.name} onChange={(e) => set("name", e.target.value)} /></Field>
              <Field label={t.ui.age}><input inputMode="numeric" value={p.age} onChange={num("age")} /></Field>
              <Field label={t.ui.heightCm}><input inputMode="numeric" value={p.heightCm} onChange={num("heightCm")} /></Field>
              <Field label={t.ui.startWeightKg}><input inputMode="decimal" value={p.startWeight} onChange={num("startWeight")} /></Field>
              <Field label={t.ui.goalWeightKg}><input inputMode="decimal" value={p.goalWeight} onChange={num("goalWeight")} /></Field>
              <Field label={t.ui.day1}><input type="date" value={p.startDate} onChange={(e) => set("startDate", e.target.value)} /></Field>
            </div>
          </div>

          <div className="sec">
            <SecH title={t.ui.training} />
            <Field label={t.ui.gymPerWeek}>
              <Opt value={String(p.sessionsPerWeek)} options={[["auto", t.ui.auto45], ["4", "4"], ["5", "5"]]} onChange={(v) => set("sessionsPerWeek", v === "auto" ? "auto" : (Number(v) as 4 | 5))} />
            </Field>
            <div style={{ marginTop: 16 }}><Field label={t.ui.padelDays}>
              <div className="opt">{t.dow3.map((d, i) => (
                <button key={d} className={p.padelDays.includes(i) ? "on" : ""} style={{ padding: "0 12px" }}
                  onClick={() => set("padelDays", p.padelDays.includes(i) ? p.padelDays.filter((x) => x !== i) : [...p.padelDays, i].sort())}>{d}</button>
              ))}</div>
            </Field></div>
            <div style={{ marginTop: 16 }}><Field label={t.ui.shopDays}>
              <div className="opt">{t.dow3.map((d, i) => (
                <button key={d} className={p.shopDays.includes(i) ? "on" : ""} style={{ padding: "0 12px" }}
                  onClick={() => set("shopDays", p.shopDays.includes(i) ? p.shopDays.filter((x) => x !== i) : [...p.shopDays, i].sort())}>{d}</button>
              ))}</div>
            </Field></div>
          </div>

          <div className="sec">
            <SecH title={t.ui.language} />
            <Opt value={state.profile.lang} options={[["fr", "Français"], ["en", "English"]] as [Lang, string][]} onChange={setLang} />
          </div>
        </div>

        <div>
          <SecH title={t.ui.nutTargets} />
          <Field label={t.ui.mode}><Opt value={p.nutritionMode} options={[["auto", t.ui.autoMode], ["manual", t.ui.manual]]} onChange={(v) => set("nutritionMode", v)} /></Field>
          {p.nutritionMode === "auto" ? <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
            <Field label={t.ui.dailyLife}><Opt value={p.activity} options={[[1.35, t.ui.seated], [1.45, t.ui.moderate], [1.55, t.ui.onFeet]]} onChange={(v) => set("activity", v)} /></Field>
            <Field label={t.ui.surplus}><Opt value={p.surplus} options={[[250, t.ui.lean], [350, t.ui.standard], [500, t.ui.hard]]} onChange={(v) => set("surplus", v)} /></Field>
            <Field label={t.ui.proteinKg}><Opt value={p.proteinPerKg} options={[1.8, 2, 2.2].map((v) => [v, `${f.dec(v)} g`] as [number, string])} onChange={(v) => set("proteinPerKg", v)} /></Field>
            <Field label={t.ui.adjust}><input inputMode="numeric" value={p.kcalAdjust} onChange={num("kcalAdjust")} /></Field>
          </div> : <div className="grid2" style={{ marginTop: 16 }}>
            {([["kcal", t.ui.calories], ["protein", t.ui.proteinG], ["carbs", t.ui.carbsG], ["fat", t.ui.fatG]] as const).map(([k, l]) => (
              <Field key={k} label={l}><input inputMode="numeric" value={p.manual[k]} onChange={(e) => setP({ ...p, manual: { ...p.manual, [k]: Number(e.target.value) || 0 } })} /></Field>
            ))}
          </div>}
          <div className="card" style={{ marginTop: 16 }}>
            <div className="lbl">{t.ui.baseTarget}</div>
            <div className="row" style={{ gap: 20, marginTop: 10, flexWrap: "wrap" }}>
              <Stat v={f.num(preview.kcal)} k="kcal" red /><Stat v={preview.p} unit="g" k={t.ui.protein} /><Stat v={preview.c} unit="g" k={t.ui.carbs} /><Stat v={preview.f} unit="g" k={t.ui.fat} />
            </div>
            <p className="lbl" style={{ marginTop: 12 }}>{t.ui.autoNote}</p>
          </div>

          <div className="sec">
            <SecH title={t.ui.habitsFood} />
            <div style={{ display: "grid", gap: 16 }}>
              <Field label={t.ui.water}><Opt value={p.waterL} options={[2.5, 3, 3.5, 4].map((v) => [v, f.w(v)] as [number, string])} onChange={(v) => set("waterL", v)} /></Field>
              <Field label={t.ui.creatine}><Opt value={p.creatine} options={[[true, t.ui.on], [false, t.ui.off]]} onChange={(v) => set("creatine", v)} /></Field>
              <Field label={t.ui.foodPrefs}>
                <div className="opt">{([["noCook", t.ui.noCook], ["noFish", t.ui.noFish], ["noPork", t.ui.noPork]] as const).map(([k, l]) => (
                  <button key={k} className={p.prefs[k] ? "on" : ""} onClick={() => setP({ ...p, prefs: { ...p.prefs, [k]: !p.prefs[k] } })}>{l}</button>
                ))}</div>
              </Field>
            </div>
          </div>

          <div style={{ position: "sticky", bottom: 96, marginTop: 24, zIndex: 5 }}>
            <button className="btn" disabled={!dirty || !valid} onClick={() => { actions.updateProfile(p); toast(t.ui.profileSaved); }}>{dirty ? t.ui.saveChanges : t.ui.saved}</button>
          </div>

          <DataSection />
        </div>
      </div>
    </div>
  );
}
