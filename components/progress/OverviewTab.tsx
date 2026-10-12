"use client";

import { Plus } from "lucide-react";
import { LOCK } from "@/lib/metrics";
import { clamp, todayKey, weekStartOf } from "@/lib/utils/date";
import type { WeeklyCheckin } from "@/lib/types";
import { suggestionCodeOf } from "@/lib/i18n";
import { useApp } from "@/components/shell/context";
import { Bar, SecH, Stat } from "@/components/ui/primitives";
import { Heatmap } from "@/components/ui/blocks";
import { WeightChart } from "./WeightChart";

export function OverviewTab() {
  const { state, metrics, open, t, f } = useApp();
  const tk = todayKey();
  const p = state.profile;
  const reviews = Object.keys(state.checkins).sort().reverse();
  const toGoal = p.goalWeight - p.startWeight;
  // Show the suggestion in the current language when it was stored as a code.
  const sugOf = (r: WeeklyCheckin) => {
    const c = r.suggestionCode ? { code: r.suggestionCode, adh: Number(r.stats.kcalAdh) || 0 } : suggestionCodeOf(r.suggestion);
    return c && t.suggestion[c.code] ? t.suggestion[c.code](c.adh) : r.suggestion;
  };
  return (
    <div className="two">
      <div>
        <div className="grid4">
          <Stat v={f.dec(p.startWeight)} unit="kg" k={t.ui.startingWeight} />
          <Stat v={metrics.hasWeights ? f.dec(metrics.currentW) : "–"} unit="kg" k={t.ui.current7} />
          <Stat v={f.dec(p.goalWeight)} unit="kg" k={t.ui.goal} />
          <Stat v={metrics.hasWeights ? f.kg(metrics.gain, true) : "–"} unit="kg" k={t.ui.gained} red />
        </div>
        {metrics.hasWeights && toGoal > 0 && (
          <div style={{ marginTop: 16 }}>
            <Bar v={Math.max(0, metrics.gain)} max={toGoal} />
            <div className="lbl" style={{ marginTop: 6 }}>{t.ui.ofGoal(Math.round(clamp(metrics.gain / toGoal, 0, 1) * 100))}</div>
          </div>
        )}
        <div className="card" style={{ marginTop: 20 }}>
          <div className="between" style={{ marginBottom: 14 }}><h2 className="h3 d">{t.ui.bodyWeight}</h2><button className="btn xs" onClick={() => open("weigh", { key: tk })}><Plus size={15} />{t.ui.logWeight}</button></div>
          <WeightChart />
        </div>
        <div className="sec">
          <SecH title={t.ui.weeklyReviews} right={<button className="chip" onClick={() => open("review", { ws: weekStartOf(tk) })}>{t.ui.thisWeek}</button>} />
          {reviews.length ? reviews.map((ws) => {
            const r = state.checkins[ws];
            return (
              <button key={ws} className="task" style={{ width: "100%", textAlign: "left" }} onClick={() => open("review", { ws })}>
                <div className="tl"><div className="tt">{t.ui.weekOfShort(f.short(ws))}</div><div className="ts">{sugOf(r)}</div></div>
                <div className="d n" style={{ fontSize: 22, fontWeight: 800 }}>{r.stats.avgScore}%</div>
              </button>
            );
          }) : <p className="mute">{t.ui.firstReview}</p>}
        </div>
      </div>
      <div>
        <div className="card">
          <h2 className="h3 d" style={{ marginBottom: 18 }}>{t.ui.consistency}</h2>
          <div className="grid2" style={{ rowGap: 22 }}>
            <Stat v={`${metrics.today.pct}%`} k={t.ui.todayFrac(metrics.today.done, metrics.today.total)} />
            <Stat v={`${metrics.week.pct}%`} k={t.ui.weekFrac(metrics.week.done, metrics.week.total)} />
            <Stat v={`${metrics.month.pct}%`} k={t.ui.thisMonth} />
            <Stat v={`${metrics.discipline}%`} k={t.ui.discipline} red />
            <Stat v={metrics.cur} unit={t.ui.days} k={t.ui.currentStreak} />
            <Stat v={metrics.best} unit={t.ui.days} k={t.ui.bestStreak} />
            <Stat v={metrics.workoutAdh != null ? `${metrics.workoutAdh}%` : "–"} k={t.ui.workoutAdh} />
            <Stat v={metrics.nutritionAdh != null ? `${metrics.nutritionAdh}%` : "–"} k={t.ui.nutritionAdh} />
          </div>
          <p className="lbl" style={{ marginTop: 16 }}>{t.ui.streakRule(LOCK)}</p>
        </div>
        <div className="card" style={{ marginTop: 14 }}>
          <h2 className="h3 d" style={{ marginBottom: 14 }}>365</h2>
          <Heatmap metrics={metrics} start={p.startDate} compact onPick={(k) => open("day", { key: k })} />
        </div>
      </div>
    </div>
  );
}
