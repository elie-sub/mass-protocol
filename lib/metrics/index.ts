import { addDays, avg, clamp, diffDays, isoDow, todayKey, weekStartOf, type DateKey } from "../utils/date";
import { buildWorkout, dayInfo } from "../program";
import { dayNutrition, weightAt, type DayNutrition } from "../nutrition";
import { isShopDay, tripFor } from "../nutrition/shopping";
import type { Checkin, Session, Slot, State } from "../types";

/* Store defaults, daily tasks, scores and metrics. Pure: display text lives in lib/i18n. */

export function defaultState(now = new Date()): State {
  // Opened in the evening? Day 1 is tomorrow morning.
  const start = now.getHours() >= 18 ? addDays(todayKey(), 1) : todayKey();
  return {
    v: 1,
    profile: {
      name: "Elie", age: 26, heightCm: 190, startWeight: 76, goalWeight: 86, startDate: start,
      sessionsPerWeek: "auto", padelDays: [0, 1, 2], activity: 1.45, surplus: 350, kcalAdjust: 0, proteinPerKg: 2.2,
      nutritionMode: "auto", manual: { kcal: 3200, protein: 170, carbs: 420, fat: 90 },
      waterL: 3, creatine: true, prefs: { noCook: false, noFish: false, noPork: false }, lang: "fr",
      shopDays: [0, 3],
    },
    days: {}, weights: {}, sessions: [], active: null, activities: [], measurements: [], photos: [], checkins: {}, seenAch: [],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrate(s: any): State {
  const d = defaultState();
  return {
    ...d, ...s,
    profile: { ...d.profile, ...(s.profile || {}), prefs: { ...d.profile.prefs, ...(s.profile?.prefs || {}) }, manual: { ...d.profile.manual, ...(s.profile?.manual || {}) } },
  };
}

export const sessionOn = (state: State, key: DateKey) => state.sessions.find((s) => s.date === key);

export type TaskSec = "Morning" | "Midday" | "Training" | "Evening";
export type TaskKind = "weigh" | "meal" | "manual" | "gym" | "auto" | "checkin" | "shop";
export interface Task {
  sec: TaskSec; id: string; kind: TaskKind; done: boolean; counted: boolean;
  optional?: boolean; auto?: boolean; slot?: Slot | "fuel";
  /** label variant for meals: the slot, or "postWorkout" */
  labelKey?: string;
  weight?: number; mealId?: string; kcal?: number; waterL?: number;
  session?: Pick<Session, "tplId" | "name" | "sets" | "volume">; workout?: { tplId: string; duration: number };
  target?: number; consumed?: number; checkin?: Checkin;
  tripEnd?: DateKey;
}

export function dayTasks(state: State, key: DateKey, nut: DayNutrition = dayNutrition(state, key)): Task[] {
  const info = dayInfo(state.profile, key);
  const day = state.days[key] || {};
  const h = day.habits || {};
  const T: Task[] = [];
  const add = (sec: TaskSec, id: string, done: unknown, kind: TaskKind, o: Partial<Task> = {}) =>
    T.push({ sec, id, done: !!done, kind, ...o, counted: o.counted !== false });
  const meal = (sec: TaskSec, slot: Slot, o: Partial<Task> = {}) => {
    const m = nut.meals.find((x) => x.slot === slot)!;
    add(sec, `meal:${slot}`, m.eaten, "meal", { slot, labelKey: slot, mealId: m.meal.id, kcal: m.meal.kcal, ...o });
  };
  const w = state.weights[key];
  add("Morning", "weigh", w != null, "weigh", { weight: w });
  meal("Morning", "breakfast");
  add("Morning", "water", h.water, "manual", { waterL: state.profile.waterL });
  if (state.profile.creatine) add("Morning", "creatine", h.creatine, "manual");
  // Reminder only: shopping never moves the score.
  if (isShopDay(state.profile, key)) add("Morning", "shop", h.shop, "shop", { counted: false, tripEnd: tripFor(state.profile, key).end });
  meal("Midday", "snack1");
  meal("Midday", "lunch");
  const sess = sessionOn(state, key);
  const wk = info.tplId ? buildWorkout(info) : null;
  if (wk || sess) {
    add("Training", "gym", !!sess, "gym", sess
      ? { session: { tplId: sess.tplId, name: sess.name, sets: sess.sets, volume: sess.volume } }
      : { workout: { tplId: wk!.tplId, duration: wk!.duration } });
  }
  meal("Training", "snack2", { labelKey: wk || sess ? "postWorkout" : "snack2" });
  if (nut.fuel) add("Training", "meal:fuel", nut.fuel.eaten, "meal", { slot: "fuel", labelKey: "fuel", counted: false, kcal: nut.fuel.meal.kcal });
  meal("Evening", "dinner");
  meal("Evening", "prebed", { counted: false, optional: true });
  const pAuto = nut.consumed.p >= nut.target.p * 0.95;
  const kAuto = nut.consumed.kcal >= nut.target.kcal * 0.95;
  add("Evening", "protein", h.protein ?? pAuto, "auto", { auto: pAuto, target: nut.target.p, consumed: nut.consumed.p });
  add("Evening", "kcal", h.kcal ?? kAuto, "auto", { auto: kAuto, target: nut.target.kcal, consumed: nut.consumed.kcal });
  add("Evening", "checkin", !!day.checkin, "checkin", { checkin: day.checkin });
  return T;
}

export const scoreOf = (tasks: Task[]) => {
  const c = tasks.filter((t) => t.counted);
  const d = c.filter((t) => t.done).length;
  return { done: d, total: c.length, pct: c.length ? Math.round((d / c.length) * 100) : 0 };
};

export const LOCK = 80; // a day "counts" for the streak at 80%+
export const maxRun = <T,>(list: T[], fn: (x: T) => boolean) => {
  let b = 0, r = 0;
  list.forEach((x) => { if (fn(x)) { r++; b = Math.max(b, r); } else r = 0; });
  return b;
};

export interface DayRec { key: DateKey; done: number; total: number; pct: number; kcalHit: boolean; proteinHit: boolean; training: boolean; trained: boolean; padel: boolean }

/** Current streak: consecutive days at LOCK+ ending yesterday or today (today may still be in progress). */
export function currentStreak(list: Pick<DayRec, "pct">[]) {
  let cur = 0;
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].pct >= LOCK) cur++;
    else if (i === list.length - 1) continue;
    else break;
  }
  return cur;
}

export function computeMetrics(state: State, today = todayKey()) {
  const start = state.profile.startDate;
  const n = clamp(diffDays(start, today) + 1, 0, 365);
  const byKey: Record<DateKey, DayRec> = {};
  const list: DayRec[] = [];
  for (let i = 0; i < n; i++) {
    const k = addDays(start, i);
    const tasks = dayTasks(state, k);
    const info = dayInfo(state.profile, k);
    const rec = {
      key: k, ...scoreOf(tasks), kcalHit: tasks.find((t) => t.id === "kcal")!.done, proteinHit: tasks.find((t) => t.id === "protein")!.done,
      training: !!info.tplId, trained: state.sessions.some((x) => x.date === k), padel: state.activities.some((a) => a.date === k && a.type === "padel"),
    };
    byKey[k] = rec; list.push(rec);
  }
  const agg = (arr: DayRec[]) => {
    const d = arr.reduce((s, r) => s + r.done, 0), t = arr.reduce((s, r) => s + r.total, 0);
    return { done: d, total: t, pct: t ? Math.round((d / t) * 100) : 0 };
  };
  const past = list.filter((r) => r.key < today);
  const todayRec = byKey[today] || { done: 0, total: 0, pct: 0 };
  const sched = list.filter((r) => r.training && (r.key < today || r.trained));
  const nutDays = [...past, ...(byKey[today]?.kcalHit ? [byKey[today]] : [])];
  const discDays = past.length ? past : list;
  const currentW = weightAt(state, today);
  return {
    byKey, list, today: todayRec, cur: currentStreak(list), best: maxRun(list, (r) => r.pct >= LOCK),
    week: agg(list.filter((r) => r.key >= weekStartOf(today))),
    month: agg(list.filter((r) => r.key.startsWith(today.slice(0, 7)))),
    workoutAdh: sched.length ? Math.round((sched.filter((r) => r.trained).length / sched.length) * 100) : null,
    nutritionAdh: nutDays.length ? Math.round((nutDays.filter((r) => r.kcalHit).length / nutDays.length) * 100) : null,
    discipline: discDays.length ? Math.round(avg(discDays.map((r) => r.pct))!) : 0,
    workouts: state.sessions.length, currentW, gain: currentW - state.profile.startWeight,
    hasWeights: Object.keys(state.weights).length > 0,
  };
}
export type Metrics = ReturnType<typeof computeMetrics>;

export const ACH: { id: string; test: (s: State, m: Metrics) => boolean }[] = [
  { id: "first_blood", test: (s, m) => m.workouts >= 1 },
  { id: "full_day", test: (s, m) => m.list.some((r) => r.pct === 100) },
  { id: "first_pr", test: (s) => s.sessions.some((x) => x.prs > 0) },
  { id: "locked7", test: (s, m) => m.best >= 7 },
  { id: "protein", test: (s, m) => maxRun(m.list, (r) => r.proteinHit) >= 7 },
  { id: "perfect_week", test: (s, m) => {
    const wk: Record<string, DayRec[]> = {};
    m.list.forEach((r) => { const w = weekStartOf(r.key); (wk[w] = wk[w] || []).push(r); });
    return Object.values(wk).some((a) => a.length === 7 && a.every((r) => r.pct === 100));
  } },
  { id: "w25", test: (s, m) => m.workouts >= 25 },
  { id: "consistency30", test: (s, m) => m.best >= 30 },
  { id: "kg5", test: (s, m) => m.hasWeights && m.gain >= 5 },
  { id: "day100", test: (s, m) => m.list.length >= 100 },
  { id: "w100", test: (s, m) => m.workouts >= 100 },
  { id: "kg10", test: (s, m) => m.hasWeights && m.gain >= 10 },
];

export function weekStats(state: State, m: Metrics, ws: DateKey) {
  const days = [...Array(7)].map((_, i) => addDays(ws, i));
  const recs = days.map((k) => m.byKey[k]).filter(Boolean);
  const wOf = (ks: DateKey[]) => avg(ks.map((k) => state.weights[k]).filter((v) => v != null));
  const wAvg = wOf(days);
  const pAvg = wOf(days.map((k) => addDays(k, -7)));
  const p2Avg = wOf(days.map((k) => addDays(k, -14)));
  const pctOf = (fn: (r: DayRec) => boolean) => (recs.length ? Math.round((recs.filter(fn).length / recs.length) * 100) : 0);
  return {
    days, nDays: recs.length, wAvg,
    change: wAvg != null && pAvg != null ? wAvg - pAvg : null,
    twoWeek: wAvg != null && p2Avg != null ? wAvg - p2Avg : null,
    gym: state.sessions.filter((s) => days.includes(s.date)).length,
    planned: days.filter((k) => dayInfo(state.profile, k).tplId).length,
    padel: state.activities.filter((a) => a.type === "padel" && days.includes(a.date)).length,
    kcalAdh: pctOf((r) => r.kcalHit), pAdh: pctOf((r) => r.proteinHit),
    avgScore: recs.length ? Math.round(avg(recs.map((r) => r.pct))!) : 0,
  };
}
export type WeekStats = ReturnType<typeof weekStats>;

export type SuggestionCode = "noData" | "flatLowAdh" | "flat" | "fast" | "firstWeek" | "onTrack";
// Suggestions only. Nothing is applied without a tap.
export function weeklySuggestion(st: Pick<WeekStats, "wAvg" | "twoWeek" | "change" | "kcalAdh">): { code: SuggestionCode; delta: number; kcalAdh: number } {
  const r = (code: SuggestionCode, delta = 0) => ({ code, delta, kcalAdh: st.kcalAdh });
  if (st.wAvg == null) return r("noData");
  if (st.twoWeek != null && st.twoWeek < 0.2) return st.kcalAdh < 70 ? r("flatLowAdh") : r("flat", 150);
  if (st.change != null && st.change > 0.7) return r("fast", -100);
  if (st.change == null) return r("firstWeek");
  return r("onTrack");
}

/** Is a weekly review due today, and for which week? */
export function reviewDue(state: State, key: DateKey) {
  const ws = weekStartOf(key);
  const idx = diffDays(state.profile.startDate, key);
  const due = (isoDow(key) === 6 && !state.checkins[ws]) || (isoDow(key) === 0 && idx >= 7 && !state.checkins[addDays(ws, -7)]);
  return { due, week: isoDow(key) === 6 ? ws : addDays(ws, -7) };
}
