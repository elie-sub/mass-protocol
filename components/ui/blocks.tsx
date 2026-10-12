"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, diffDays, isoDow, todayKey, weekStartOf } from "@/lib/utils/date";
import type { DayNutrition } from "@/lib/nutrition";
import type { Metrics } from "@/lib/metrics";
import { useApp } from "@/components/shell/context";
import { Bar } from "./primitives";

export function MacroBars({ nut, big }: { nut: DayNutrition; big?: boolean }) {
  const { t, f } = useApp();
  const rows: [string, number, number, string][] = [
    [t.ui.calories, nut.consumed.kcal, nut.target.kcal, "kcal"], [t.ui.protein, nut.consumed.p, nut.target.p, "g"],
    [t.ui.carbs, nut.consumed.c, nut.target.c, "g"], [t.ui.fat, nut.consumed.f, nut.target.f, "g"],
  ];
  return (
    <div style={{ display: "grid", gap: big ? 18 : 14 }}>
      {rows.map(([k, v, tg, u], i) => (
        <div key={k}>
          <div className="between" style={{ marginBottom: 7 }}>
            <span className="lbl" style={{ color: i < 2 ? "var(--text)" : undefined, fontWeight: 600 }}>{k}</span>
            <span className="n"><b className="d" style={{ fontSize: i === 0 && big ? 26 : 19, fontWeight: 800 }}>{f.num(v)}</b><span className="mute"> / {f.num(tg)} {u}</span></span>
          </div>
          <Bar v={v} max={tg} white={i > 1} />
        </div>
      ))}
    </div>
  );
}

export function Rail({ week, dayNum }: { week: number; dayNum: number }) {
  const { t } = useApp();
  return <div className="rail" aria-label={t.ui.weekOf52(week)}>{[...Array(52)].map((_, i) => <i key={i} className={i + 1 < week ? "f" : i + 1 === week && dayNum > 0 ? "c" : ""} />)}</div>;
}

export function Heatmap({ metrics, start, onPick, compact }: { metrics: Metrics; start: string; onPick?: (k: string) => void; compact?: boolean }) {
  const { f } = useApp();
  const today = todayKey();
  const first = weekStartOf(start);
  const cells = [];
  for (let k = first; diffDays(start, k) < 365 || isoDow(k) !== 0; k = addDays(k, 1)) {
    const idx = diffDays(start, k);
    if (idx < 0 || idx >= 365) { cells.push(<i key={k} style={{ visibility: "hidden" }} />); continue; }
    const r = metrics.byKey[k];
    const lv = !r || r.pct === 0 ? "" : r.pct === 100 ? "l5" : r.pct >= 75 ? "l4" : r.pct >= 50 ? "l3" : r.pct >= 25 ? "l2" : "l1";
    cells.push(<i key={k} title={`${f.short(k)}${r ? `: ${r.pct}%` : ""}`} onClick={() => onPick && onPick(k)}
      className={`${k > today ? "fut" : ""} ${lv} ${k === today ? "today" : ""}`} style={{ cursor: onPick ? "pointer" : undefined }} />);
  }
  return (
    <div>
      <div className="scroll-x"><div className="hm" style={{ minWidth: compact ? 0 : 640 }}>{cells}</div></div>
      <div className="row" style={{ gap: 6, marginTop: 10, fontSize: 11, color: "var(--mute)" }}>
        <span>0%</span>{["", "l1", "l2", "l3", "l4", "l5"].map((c) => <i key={c} className={c} style={{ width: 11, height: 11, background: "var(--s2)", display: "inline-block", borderRadius: 1 }} />)}<span>100%</span>
      </div>
    </div>
  );
}

export function DayNav({ k, setK }: { k: string; setK: (k: string) => void }) {
  const { t, f } = useApp();
  const tk = todayKey();
  return (
    <div className="row" style={{ gap: 4 }}>
      <button className="ib" onClick={() => setK(addDays(k, -1))} aria-label={t.ui.prevDay}><ChevronLeft size={20} /></button>
      <button className="chip" style={{ height: 34, minWidth: 110, justifyContent: "center" }} onClick={() => setK(tk)}>{k === tk ? t.ui.today : f.short(k)}</button>
      <button className="ib" onClick={() => setK(addDays(k, 1))} aria-label={t.ui.nextDay}><ChevronRight size={20} /></button>
    </div>
  );
}
