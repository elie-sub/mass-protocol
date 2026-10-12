"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { buildWorkout, dayInfo } from "@/lib/program";
import { dayNutrition } from "@/lib/nutrition";
import { dayTasks, scoreOf, sessionOn } from "@/lib/metrics";
import { addDays, pad, todayKey } from "@/lib/utils/date";
import { useApp } from "@/components/shell/context";
import { Ring, Sheet } from "@/components/ui/primitives";
import { Checklist } from "@/components/today/Checklist";

export function DaySheet({ dateKey, onClose }: { dateKey: string; onClose: () => void }) {
  const { state, actions, t, f } = useApp();
  const [k, setK] = useState(dateKey);
  const inf = dayInfo(state.profile, k);
  const nut = dayNutrition(state, k);
  const tasks = dayTasks(state, k, nut);
  const sc = scoreOf(tasks);
  const sess = sessionOn(state, k);
  const wk = buildWorkout(inf);
  const tk = todayKey();
  const future = k > tk;
  const note = state.days[k]?.note || "";
  const row = { padding: "7px 0", borderBottom: "1px solid var(--line)" };
  return (
    <Sheet title={t.ui.dayN(pad(inf.dayNum, 3))} onClose={onClose} closeLabel={t.ui.close}>
      <div className="between">
        <button className="ib" disabled={inf.idx <= 0} onClick={() => setK(addDays(k, -1))} aria-label={t.ui.prevDay}><ChevronLeft size={20} /></button>
        <div style={{ textAlign: "center" }}><div className="h3 d">{f.date(k)}</div><div className="lbl">{t.ui.phaseWeek(inf.phase.id, f.phase(inf.phase.id).name, inf.week)}</div></div>
        <button className="ib" disabled={inf.idx >= 364} onClick={() => setK(addDays(k, 1))} aria-label={t.ui.nextDay}><ChevronRight size={20} /></button>
      </div>
      {!inf.inProgram ? <p className="mute" style={{ marginTop: 20 }}>{t.ui.outsideProgram}</p> : <>
        <div className="row" style={{ marginTop: 18, gap: 18 }}>
          <Ring pct={future ? 0 : sc.pct} size={92} stroke={6}><div className="d n" style={{ fontSize: 28, fontWeight: 900 }}>{future ? "–" : `${sc.pct}%`}</div></Ring>
          <div><div className="d n" style={{ fontSize: 26, fontWeight: 800 }}>{future ? t.ui.planned : `${sc.done} / ${sc.total}`}</div><div className="lbl">{t.ui.completion}</div></div>
        </div>

        <div className="sec" style={{ marginTop: 22 }}>
          <h3 className="h3 d" style={{ marginBottom: 6 }}>{t.ui.workout}</h3>
          {sess ? <p>{t.ui.sessLine(f.sessName(sess), sess.sets, f.num(sess.volume), f.dur(sess.endedAt - sess.startedAt), sess.prs)}</p>
            : wk ? <>
              {wk.exercises.map((x) => <div key={x.exId} className="between" style={row}><span style={{ fontSize: 14 }}>{f.exName(x.exId)}</span><span className="d n" style={{ fontWeight: 800 }}>{x.sets} × {x.reps[0]}-{x.reps[1]}</span></div>)}
              {k === tk && <button className="btn sm" style={{ marginTop: 12, width: "100%" }} onClick={() => { onClose(); actions.goWorkout(k); }}><Play size={16} fill="#fff" />{t.ui.startWorkout}</button>}
            </>
            : <p className="mute">{t.ui.restDayDot}{inf.padelPlanned ? t.ui.padelPlannedDot : ""}</p>}
        </div>

        <div className="sec" style={{ marginTop: 22 }}>
          <h3 className="h3 d" style={{ marginBottom: 6 }}>{t.ui.nutrition}</h3>
          <p className="lbl" style={{ marginBottom: 6 }}>{t.ui.nutLine(f.num(nut.consumed.kcal), f.num(nut.target.kcal), Math.round(nut.consumed.p), nut.target.p)}</p>
          {nut.meals.map((m) => (
            <div key={m.slot} className="between" style={row}>
              <span style={{ fontSize: 14 }}><span className="mute">{t.slots[m.slot]}.</span> {f.meal(m.meal.id).name}</span>
              <span className="d n" style={{ fontWeight: 800, color: m.eaten ? "var(--red)" : undefined }}>{m.eaten ? t.ui.eaten : f.num(m.meal.kcal)}</span>
            </div>
          ))}
        </div>

        <div className="sec" style={{ marginTop: 22 }}>
          <h3 className="h3 d" style={{ marginBottom: 2 }}>{t.ui.habits}</h3>
          {future ? <p className="mute">{t.ui.opensOnDay}</p> : <Checklist tasks={tasks} dateKey={k} />}
        </div>

        <div className="sec" style={{ marginTop: 22 }}>
          <h3 className="h3 d" style={{ marginBottom: 8 }}>{t.ui.notes}</h3>
          <textarea rows={3} value={note} placeholder={t.ui.howDidItGo} onChange={(e) => actions.setNote(k, e.target.value)} />
        </div>
      </>}
    </Sheet>
  );
}
