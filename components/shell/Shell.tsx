"use client";

import { useCallback, type ReactNode } from "react";
import Link from "next/link";
import { Activity as ActivityIcon, CalendarDays, Check, Crosshair, Dumbbell, LineChart, Trophy, User, UtensilsCrossed, X } from "lucide-react";
import { dayInfo } from "@/lib/program";
import { clamp, todayKey } from "@/lib/utils/date";
import type { Session } from "@/lib/types";
import { TAB_PATH, useApp, type SheetState, type Tab } from "./context";
import { DayComplete } from "./Splash";
import { Bar } from "@/components/ui/primitives";
import { WorkoutMode } from "@/components/workout/WorkoutMode";
import { WorkoutSummary } from "@/components/workout/WorkoutSummary";
import { RecipeSheet } from "@/components/sheets/MealSheets";
import { ActivitySheet, CheckinSheet, WeighSheet } from "@/components/sheets/QuickSheets";
import { DaySheet } from "@/components/sheets/DaySheet";
import { ReviewSheet } from "@/components/sheets/ReviewSheet";

const TABS: [Tab, typeof Crosshair][] = [
  ["today", Crosshair], ["calendar", CalendarDays], ["training", Dumbbell],
  ["nutrition", UtensilsCrossed], ["progress", LineChart], ["profile", User],
];

interface Props {
  pathname: string; sheet: SheetState | null; wmOpen: boolean; setWmOpen: (v: boolean) => void;
  summary: Session | null; setSummary: (s: Session | null) => void; celebrate: number | null; setCelebrate: (n: number | null) => void;
  toastMsg: { msg: string; kind?: "err" | "ach" } | null; children: ReactNode;
}

export function Shell({ pathname, sheet, wmOpen, setWmOpen, summary, setSummary, celebrate, setCelebrate, toastMsg, children }: Props) {
  const { state, metrics, close, t } = useApp();
  const active = (id: Tab) => (id === "today" ? pathname === "/" : pathname.startsWith(TAB_PATH[id]) || (id === "nutrition" && pathname.startsWith("/groceries")));
  const endCelebrate = useCallback(() => setCelebrate(null), [setCelebrate]);
  const top = () => window.scrollTo({ top: 0 });

  return (
    <div className="mp">
      <div className="shell">
        <aside className="side">
          <div className="brand d up"><div className="b1">Elie</div><div className="b2">{t.ui.massProtocol}</div></div>
          <nav>{TABS.map(([id, Icon]) => (
            <Link key={id} href={TAB_PATH[id]} onClick={top} className={active(id) ? "on" : ""}><Icon size={18} />{t.nav[id]}</Link>
          ))}</nav>
          <div style={{ marginTop: "auto" }}>
            <div className="lbl">{t.ui.dayOf365(clamp(dayInfo(state.profile, todayKey()).dayNum, 0, 365))}</div>
            <div style={{ marginTop: 8 }}><Bar v={metrics.list.length} max={365} /></div>
            <div className="row" style={{ marginTop: 16, gap: 8 }}><ActivityIcon size={15} color="var(--red)" /><span className="lbl">{t.ui.streakWeek(metrics.cur, metrics.week.pct)}</span></div>
          </div>
        </aside>
        <main className="main">{children}</main>
      </div>
      <nav className="bnav">{TABS.map(([id, Icon]) => (
        <Link key={id} href={TAB_PATH[id]} onClick={top} className={active(id) ? "on" : ""} aria-label={t.nav[id]}>
          <Icon size={21} strokeWidth={active(id) ? 2.4 : 1.8} />{t.navShort[id]}
        </Link>
      ))}</nav>

      {sheet?.type === "recipe" && <RecipeSheet dateKey={sheet.key} slot={sheet.slot} onClose={close} />}
      {sheet?.type === "weigh" && <WeighSheet dateKey={sheet.key} onClose={close} />}
      {sheet?.type === "activity" && <ActivitySheet dateKey={sheet.key} preset={sheet.preset} onClose={close} />}
      {sheet?.type === "checkin" && <CheckinSheet dateKey={sheet.key} onClose={close} />}
      {sheet?.type === "day" && <DaySheet dateKey={sheet.key} onClose={close} />}
      {sheet?.type === "review" && <ReviewSheet ws={sheet.ws} onClose={close} />}

      {state.active && wmOpen && <WorkoutMode onClose={() => setWmOpen(false)} />}
      {summary && <WorkoutSummary s={summary} onDone={() => setSummary(null)} />}
      {celebrate && <DayComplete dayNum={celebrate} onClose={endCelebrate} t={t} />}
      {toastMsg && (
        <div className={`toast ${toastMsg.kind ? "red" : ""}`} role="status">
          {toastMsg.kind === "ach" ? <Trophy size={16} /> : toastMsg.kind === "err" ? <X size={16} /> : <Check size={16} strokeWidth={3} />}{toastMsg.msg}
        </div>
      )}
    </div>
  );
}
