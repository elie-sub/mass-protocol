"use client";

import { Check, Plus, Trash2 } from "lucide-react";
import { activityKcal } from "@/lib/nutrition";
import type { DayInfo } from "@/lib/program";
import { useApp } from "@/components/shell/context";

export function ActivityBlock({ dateKey, info }: { dateKey: string; info: DayInfo }) {
  const { state, actions, open, t, f } = useApp();
  const acts = state.activities.filter((a) => a.date === dateKey);
  const padelLogged = acts.some((a) => a.type === "padel");
  return (
    <div>
      {info.padelPlanned && !padelLogged && (
        <div className="task">
          <span className="chk auto" />
          <div className="tl"><div className="tt">{t.ui.padelPlanned}</div><div className="ts">{t.ui.padelPlannedSub}</div></div>
          <button className="btn xs ghost" onClick={() => open("activity", { key: dateKey, preset: "padel" })}>{t.ui.log}</button>
        </div>
      )}
      {acts.map((a) => (
        <div className="task" key={a.id}>
          <span className="chk on" style={{ animation: "none" }}><Check size={17} strokeWidth={3} color="#fff" /></span>
          <div className="tl">
            <div className="tt">{t.ui.actLine(t.act[a.type], a.duration)}</div>
            <div className="ts">{t.ui.actSub(t.intensity[a.intensity], f.num(Math.round(activityKcal(a) / 50) * 50))}</div>
          </div>
          <button className="ib" onClick={() => actions.removeActivity(a.id)} aria-label={t.ui.removeActivity}><Trash2 size={17} /></button>
        </div>
      ))}
      <button className="btn ghost sm" style={{ width: "100%", marginTop: 12 }} onClick={() => open("activity", { key: dateKey })}><Plus size={18} />{t.ui.addActivity}</button>
    </div>
  );
}
