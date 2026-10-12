"use client";

import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { dayInfo } from "@/lib/program";
import { LOCK, sessionOn } from "@/lib/metrics";
import { addDays, keyOf, parseKey, todayKey, weekStartOf } from "@/lib/utils/date";
import { useApp } from "@/components/shell/context";
import { Bar, Dot, Seg, Stat } from "@/components/ui/primitives";
import { Heatmap } from "@/components/ui/blocks";

type View = "week" | "month" | "year";

export function CalendarPage() {
  const { state, metrics, open, t, f } = useApp();
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(todayKey());
  const tk = todayKey();
  const start = state.profile.startDate;
  const end = addDays(start, 364);

  const dayMeta = (k: string) => {
    const inf = dayInfo(state.profile, k);
    const sess = sessionOn(state, k);
    const padel = state.activities.some((a) => a.date === k && a.type === "padel");
    const tag = !inf.inProgram ? "" : sess ? t.tpl[sess.tplId]?.short || "GYM" : inf.tplId ? t.tpl[inf.tplId].short : t.ui.restShort;
    return { inf, sess, padel, rec: metrics.byKey[k], tag };
  };

  let body: ReactNode;
  if (view === "month") {
    const d = parseKey(cursor);
    const first = keyOf(new Date(d.getFullYear(), d.getMonth(), 1));
    const last = keyOf(new Date(d.getFullYear(), d.getMonth() + 1, 0));
    const to = addDays(weekStartOf(last), 6);
    const cells = [];
    for (let k = weekStartOf(first); k <= to; k = addDays(k, 1)) {
      const { inf, padel, rec, tag, sess } = dayMeta(k);
      const out = k < first || k > last;
      cells.push(
        <button key={k} className={`c ${k === tk ? "today" : ""} ${out ? "out" : ""}`} onClick={() => inf.inProgram && open("day", { key: k })} disabled={!inf.inProgram} style={{ opacity: !inf.inProgram && !out ? 0.35 : undefined }}>
          {rec && rec.pct > 0 && <span className="fill" style={{ height: `${rec.pct}%`, opacity: rec.pct === 100 ? 0.95 : 0.55 }} />}
          <span className="row between" style={{ gap: 2 }}><span className="dn n">{parseKey(k).getDate()}</span>{(padel || (inf.inProgram && inf.padelPlanned)) && <Dot size={5} color={padel ? "var(--text)" : "var(--dim)"} />}</span>
          <span className="tg" style={{ color: sess ? "var(--text)" : undefined }}>{tag}</span>
        </button>,
      );
    }
    const month = t.months[d.getMonth()];
    body = (
      <>
        <div className="between" style={{ marginBottom: 12 }}>
          <button className="ib" onClick={() => setCursor(keyOf(new Date(d.getFullYear(), d.getMonth() - 1, 1)))} aria-label={t.ui.prevMonth}><ChevronLeft size={20} /></button>
          <div className="h2 d">{month[0].toUpperCase() + month.slice(1)} {d.getFullYear()}</div>
          <button className="ib" onClick={() => setCursor(keyOf(new Date(d.getFullYear(), d.getMonth() + 1, 1)))} aria-label={t.ui.nextMonth}><ChevronRight size={20} /></button>
        </div>
        <div className="cal" style={{ marginBottom: 4 }}>{t.dow3.map((x) => <div key={x} className="lbl" style={{ textAlign: "center", fontSize: 11 }}>{x}</div>)}</div>
        <div className="cal">{cells}</div>
        <div className="row" style={{ gap: 16, marginTop: 14, flexWrap: "wrap" }}>
          <span className="lbl row" style={{ gap: 6 }}><span style={{ width: 10, height: 10, background: "var(--red)" }} />{t.ui.fillScore}</span>
          <span className="lbl row" style={{ gap: 6 }}><Dot color="var(--text)" />{t.ui.padelPlayed}</span>
          <span className="lbl row" style={{ gap: 6 }}><Dot color="var(--dim)" />{t.ui.padelPlanned}</span>
        </div>
      </>
    );
  } else if (view === "week") {
    const ws = weekStartOf(cursor);
    body = (
      <>
        <div className="between" style={{ marginBottom: 12 }}>
          <button className="ib" onClick={() => setCursor(addDays(ws, -7))} aria-label={t.ui.prevWeek}><ChevronLeft size={20} /></button>
          <div className="h2 d">{t.ui.rangeTo(f.short(ws), f.short(addDays(ws, 6)))}</div>
          <button className="ib" onClick={() => setCursor(addDays(ws, 7))} aria-label={t.ui.nextWeek}><ChevronRight size={20} /></button>
        </div>
        {[...Array(7)].map((_, i) => {
          const k = addDays(ws, i);
          const { inf, padel, rec, sess } = dayMeta(k);
          const name = !inf.inProgram ? t.ui.outside : sess ? f.sessName(sess) : inf.tplId ? f.tplName(inf.tplId) : t.ui.rest;
          return (
            <button key={k} className="task" style={{ width: "100%", textAlign: "left" }} disabled={!inf.inProgram} onClick={() => open("day", { key: k })}>
              <div style={{ width: 52 }}><div className="d" style={{ fontWeight: 800, color: k === tk ? "var(--red)" : "var(--mute)" }}>{t.dow3[i]}</div><div className="d n" style={{ fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{parseKey(k).getDate()}</div></div>
              <div className="tl">
                <div className="tt" style={{ textDecoration: "none" }}>{name}{(padel || inf.padelPlanned) && inf.inProgram && <span className={`chip ${padel ? "r" : ""}`} style={{ marginLeft: 8, height: 20 }}>{t.ui.padel}</span>}</div>
                {inf.inProgram && <div className="ts">{t.ui.dayLine(inf.dayNum, rec ? t.ui.doneOf(rec.done, rec.total) : k > tk ? t.ui.planned : "")}</div>}
                {rec && <div style={{ marginTop: 6 }}><Bar v={rec.pct} max={100} /></div>}
              </div>
              <div className="d n" style={{ fontSize: 24, fontWeight: 800, width: 56, textAlign: "right" }}>{rec ? `${rec.pct}%` : ""}</div>
            </button>
          );
        })}
      </>
    );
  } else {
    const past = metrics.list.filter((r) => r.key < tk);
    body = (
      <>
        <div className="grid3" style={{ marginBottom: 22 }}>
          <Stat v={metrics.list.filter((r) => r.pct >= LOCK).length} k={t.ui.days80} red />
          <Stat v={past.filter((r) => r.pct < 25).length} k={t.ui.missedDays} />
          <Stat v={365 - metrics.list.length} k={t.ui.daysToGo} />
        </div>
        <Heatmap metrics={metrics} start={start} onPick={(k) => open("day", { key: k })} />
        <p className="lbl" style={{ marginTop: 12 }}>{t.ui.yearNote(f.date(start), f.date(end))}</p>
      </>
    );
  }

  return (
    <div className="wrap">
      <div className="between" style={{ flexWrap: "wrap" }}>
        <div><div className="lbl">{t.ui.days365}</div><h1 className="h1 d" style={{ marginTop: 6 }}>{t.ui.calendar}</h1></div>
        <button className="chip" style={{ height: 34 }} onClick={() => { setCursor(tk); open("day", { key: tk }); }}>{t.ui.openToday}</button>
      </div>
      <div style={{ marginTop: 18, maxWidth: 420 }}><Seg value={view} onChange={setView} options={[["week", t.ui.week], ["month", t.ui.month], ["year", t.ui.year]]} /></div>
      <div className="card" style={{ marginTop: 16, maxWidth: view === "year" ? undefined : 760 }}>{body}</div>
    </div>
  );
}
