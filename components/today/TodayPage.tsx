"use client";

import { ChevronRight, Zap } from "lucide-react";
import { dayInfo } from "@/lib/program";
import { dayNutrition } from "@/lib/nutrition";
import { LOCK, dayTasks, reviewDue, scoreOf } from "@/lib/metrics";
import { addDays, pad, todayKey } from "@/lib/utils/date";
import { useApp } from "@/components/shell/context";
import { Ring, Stat } from "@/components/ui/primitives";
import { Heatmap, MacroBars, Rail } from "@/components/ui/blocks";
import { Checklist } from "./Checklist";
import { NextUp } from "./NextUp";
import { ActivityBlock } from "./ActivityBlock";

export function TodayPage() {
  const { state, metrics, open, actions, setTab, t, f } = useApp();
  const key = todayKey();
  const info = dayInfo(state.profile, key);
  const nut = dayNutrition(state, key);
  const tasks = dayTasks(state, key, nut);
  const sc = scoreOf(tasks);
  const name = state.profile.name;
  const hello = `${t.greeting(new Date().getHours())}, ${name}`;

  if (info.idx < 0) {
    return (
      <div className="wrap">
        <div className="lbl">{hello}</div>
        <div className="h1 d" style={{ fontSize: 88, marginTop: 10 }}>T–{-info.idx}</div>
        <p className="mute" style={{ marginTop: 10 }}>{t.ui.startsIn(f.date(state.profile.startDate))}</p>
        <button className="btn" style={{ marginTop: 24, maxWidth: 360 }} onClick={() => actions.updateProfile({ startDate: key })}>{t.ui.startToday}</button>
      </div>
    );
  }
  if (info.idx >= 365) {
    return (
      <div className="wrap">
        <div className="h1 d" style={{ fontSize: 72 }}>{t.ui.missionComplete}</div>
        <p className="mute" style={{ marginTop: 12 }}>{t.ui.missionDone(f.kg(metrics.gain, true), metrics.workouts)}</p>
        <button className="btn" style={{ marginTop: 24, maxWidth: 360 }} onClick={() => setTab("progress")}>{t.ui.seeYear}</button>
      </div>
    );
  }

  const yRec = metrics.byKey[addDays(key, -1)];
  const showBack = yRec && yRec.pct < LOCK && sc.pct < 50;
  const review = reviewDue(state, key);
  const pctMission = Math.round((info.dayNum / 365) * 100);
  const phase = f.phase(info.phase.id);

  return (
    <div className="wrap">
      <div className="two">
        <div>
          <div className="lbl" style={{ fontSize: 14 }}>{hello}</div>
          <div className="d n" style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: "clamp(64px, 20vw, 132px)", whiteSpace: "nowrap", fontWeight: 900, lineHeight: 0.8 }}>{t.ui.day} {pad(info.dayNum, 3)}</span>
            <span className="dim" style={{ fontSize: 26, fontWeight: 800, paddingBottom: 2 }}>/365</span>
          </div>
          <div className="row" style={{ marginTop: 14, gap: 10, flexWrap: "wrap" }}>
            <span className="chip r">{t.ui.phaseChip(info.phase.id, phase.name)}</span>
            <span className="chip">{t.ui.weekOf(info.weekInPhase, info.phaseWeeks)}</span>
            {info.deload && <span className="chip">{t.ui.deload}</span>}
            {nut.highActivity && <span className="chip r"><Zap size={13} />{t.ui.highActivity}</span>}
          </div>
          <div style={{ marginTop: 16 }}><Rail week={info.week} dayNum={info.dayNum} /></div>
          <p className="d up" style={{ fontSize: 22, fontWeight: 700, marginTop: 16, color: "var(--mute)" }}>{t.quotes[info.idx % t.quotes.length]}</p>

          <div className="card" style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 20 }}>
            <Ring pct={sc.pct}>
              <div className="d n" style={{ fontSize: 46, fontWeight: 900, lineHeight: 0.9 }}>{sc.pct}<span style={{ fontSize: 20 }}>%</span></div>
              <div className="lbl" style={{ fontSize: 11 }}>{t.ui.todayScore}</div>
            </Ring>
            <div style={{ display: "grid", gap: 14, flex: 1 }}>
              <div><div className="d n" style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>{sc.done} / {sc.total}</div><div className="lbl">{t.ui.doneToday}</div></div>
              <div className="grid2" style={{ gap: 12 }}>
                <div><div className="d n" style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{metrics.cur}<span className="mute" style={{ fontSize: 13 }}> {t.ui.days}</span></div><div className="lbl">{t.ui.streak}</div></div>
                <div><div className="d n" style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{metrics.week.pct}%</div><div className="lbl">{t.ui.thisWeek}</div></div>
              </div>
            </div>
          </div>

          {showBack && (
            <div className="card flat" style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 18 }}>
              <div><div className="d n" style={{ fontSize: 28, fontWeight: 800 }}>{yRec.pct}%</div><div className="lbl">{t.ui.yesterday}</div></div>
              <div><div className="d n" style={{ fontSize: 28, fontWeight: 800 }}>{sc.pct}%</div><div className="lbl">{t.ui.today}</div></div>
              <div className="d up red" style={{ fontSize: 26, fontWeight: 900, marginLeft: "auto" }}>{t.ui.backToWork}</div>
            </div>
          )}

          {state.active && (
            <button className="card" style={{ marginTop: 12, width: "100%", textAlign: "left", borderColor: "var(--red)" }} onClick={() => actions.goWorkout(state.active!.date)}>
              <div className="between"><div><div className="lbl">{t.ui.workoutInProgress}</div><div className="h3 d" style={{ marginTop: 4 }}>{f.tplName(state.active.tplId, state.active.name)}</div></div><span className="btn sm">{t.ui.resume}</span></div>
            </button>
          )}

          {review.due && (
            <button className="card" style={{ marginTop: 12, width: "100%", textAlign: "left" }} onClick={() => open("review", { ws: review.week })}>
              <div className="between"><div><div className="lbl">{t.ui.reviewReady}</div><div className="h3 d" style={{ marginTop: 4 }}>{t.ui.closeWeek}</div></div><ChevronRight size={20} /></div>
            </button>
          )}

          <div style={{ marginTop: 12 }}><NextUp tasks={tasks} nut={nut} dateKey={key} /></div>

          <div className="sec" style={{ marginTop: 18 }}>
            <Checklist tasks={tasks} dateKey={key} />
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <div className="between" style={{ marginBottom: 16 }}>
              <h2 className="h3 d">{t.ui.fuel}</h2>
              <button className="chip" onClick={() => setTab("nutrition")}>{t.ui.meals}<ChevronRight size={13} /></button>
            </div>
            <MacroBars nut={nut} />
            {nut.highActivity && <p className="lbl" style={{ marginTop: 14 }}>{t.ui.bigDay(f.num(nut.bonus))}</p>}
          </div>
          <div className="card">
            <h2 className="h3 d" style={{ marginBottom: 6 }}>{t.ui.activity}</h2>
            <ActivityBlock dateKey={key} info={info} />
          </div>
          <div className="card">
            <h2 className="h3 d" style={{ marginBottom: 16 }}>{t.ui.theMission}</h2>
            <div className="grid2" style={{ rowGap: 22 }}>
              <Stat v={`${pctMission}%`} k={t.ui.ofTransformation} red />
              <Stat v={metrics.cur} k={t.ui.currentStreak} />
              <Stat v={metrics.hasWeights ? f.kg(metrics.gain, true) : "–"} unit="kg" k={t.ui.gain7} />
              <Stat v={metrics.workouts} k={t.ui.workouts} />
              <Stat v={`${metrics.discipline}%`} k={t.ui.discipline} />
              <Stat v={metrics.best} k={t.ui.bestStreak} />
            </div>
          </div>
          <div className="card">
            <div className="between" style={{ marginBottom: 14 }}><h2 className="h3 d">365</h2><button className="chip" onClick={() => setTab("calendar")}>{t.ui.calendar}<ChevronRight size={13} /></button></div>
            <Heatmap metrics={metrics} start={state.profile.startDate} compact onPick={(k) => open("day", { key: k })} />
          </div>
        </div>
      </div>
    </div>
  );
}
