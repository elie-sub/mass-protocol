import { addDays, clamp, diffDays, isoDow, weekStartOf, type DateKey } from "../utils/date";
import type { Profile, Session } from "../types";

/* Program engine. Pure functions only: display text lives in lib/i18n. */

export interface Phase { id: number; weeks: [number, number] }
export const PHASES: Phase[] = [
  { id: 1, weeks: [1, 8] },
  { id: 2, weeks: [9, 20] },
  { id: 3, weeks: [21, 32] },
  { id: 4, weeks: [33, 44] },
  { id: 5, weeks: [45, 52] },
];

export interface ExMeta { inc: number; iso?: boolean; bw?: boolean; alt: string[] }
// iso: isolation; inc: weight jump (kg) when the rep range is beaten
export const EX: Record<string, ExMeta> = {
  inc_db_press: { inc: 2, alt: ["inc_bb_press", "inc_machine"] },
  inc_bb_press: { inc: 2.5, alt: ["inc_db_press", "inc_machine"] },
  inc_machine: { inc: 2.5, alt: ["inc_db_press", "inc_bb_press"] },
  bench: { inc: 2.5, alt: ["db_bench", "machine_press"] },
  db_bench: { inc: 2, alt: ["bench", "machine_press"] },
  machine_press: { inc: 2.5, alt: ["bench", "db_bench"] },
  db_ohp: { inc: 2, alt: ["machine_ohp"] },
  machine_ohp: { inc: 2.5, alt: ["db_ohp"] },
  cable_lat: { inc: 1.25, iso: true, alt: ["db_lat"] },
  db_lat: { inc: 1, iso: true, alt: ["cable_lat"] },
  cable_fly: { inc: 2.5, iso: true, alt: ["pec_deck"] },
  pec_deck: { inc: 2.5, iso: true, alt: ["cable_fly"] },
  oh_tri: { inc: 2.5, iso: true, alt: ["skull", "pushdown"] },
  pushdown: { inc: 2.5, iso: true, alt: ["oh_tri"] },
  skull: { inc: 2.5, iso: true, alt: ["oh_tri"] },
  dips: { inc: 2.5, alt: ["pushdown", "machine_press"], bw: true },
  lat_pd: { inc: 2.5, alt: ["pullup"] },
  pullup: { inc: 2.5, alt: ["lat_pd"], bw: true },
  cs_row: { inc: 2.5, alt: ["cable_row", "db_row"] },
  cable_row: { inc: 2.5, alt: ["cs_row", "db_row"] },
  db_row: { inc: 2, alt: ["cs_row", "cable_row"] },
  straight_pd: { inc: 2.5, iso: true, alt: ["lat_pd"] },
  face_pull: { inc: 2.5, iso: true, alt: ["rear_fly"] },
  rear_fly: { inc: 2.5, iso: true, alt: ["face_pull"] },
  inc_curl: { inc: 1, iso: true, alt: ["ez_curl", "cable_curl"] },
  ez_curl: { inc: 2.5, iso: true, alt: ["inc_curl", "cable_curl"] },
  cable_curl: { inc: 2.5, iso: true, alt: ["hammer", "ez_curl"] },
  hammer: { inc: 1, iso: true, alt: ["cable_curl"] },
  squat: { inc: 2.5, alt: ["hack", "smith_squat"] },
  smith_squat: { inc: 2.5, alt: ["squat", "hack"] },
  hack: { inc: 5, alt: ["leg_press", "smith_squat"] },
  leg_press: { inc: 5, alt: ["hack"] },
  rdl: { inc: 2.5, alt: ["lying_curl"] },
  lying_curl: { inc: 2.5, iso: true, alt: ["seated_curl"] },
  seated_curl: { inc: 2.5, iso: true, alt: ["lying_curl"] },
  leg_ext: { inc: 2.5, iso: true, alt: ["leg_press"] },
  lunge: { inc: 2, alt: ["leg_press"] },
  calf_stand: { inc: 2.5, iso: true, alt: ["calf_seat"] },
  calf_seat: { inc: 2.5, iso: true, alt: ["calf_stand"] },
  cable_crunch: { inc: 2.5, iso: true, alt: ["hlr"] },
  hlr: { inc: 2.5, iso: true, alt: ["cable_crunch"], bw: true },
};
const FOCUS_P4 = new Set(["cable_lat", "db_lat", "inc_db_press", "inc_bb_press", "inc_curl", "ez_curl", "cable_curl", "oh_tri", "skull", "rear_fly", "face_pull"]);

interface TplEx { id: string; sets: number; reps: [number, number]; rest: number }
const e = (id: string, sets: number, lo: number, hi: number, rest: number): TplEx => ({ id, sets, reps: [lo, hi], rest });
export type TplId = "push" | "pull" | "legs" | "upper" | "lower";
export const TEMPLATES: Record<TplId, { ex: TplEx[] }> = {
  push: { ex: [e("inc_db_press", 4, 8, 10, 120), e("bench", 3, 6, 8, 150), e("db_ohp", 3, 8, 10, 120), e("cable_lat", 4, 12, 15, 60), e("cable_fly", 3, 12, 15, 75), e("oh_tri", 3, 10, 12, 75), e("pushdown", 2, 12, 15, 60)] },
  pull: { ex: [e("lat_pd", 4, 8, 10, 120), e("cs_row", 4, 8, 10, 120), e("cable_row", 3, 10, 12, 90), e("straight_pd", 2, 12, 15, 60), e("face_pull", 3, 15, 20, 60), e("inc_curl", 3, 10, 12, 75), e("hammer", 2, 10, 12, 60)] },
  legs: { ex: [e("squat", 4, 6, 8, 180), e("rdl", 3, 8, 10, 150), e("leg_press", 3, 10, 12, 120), e("lying_curl", 3, 10, 12, 75), e("leg_ext", 2, 12, 15, 60), e("calf_stand", 4, 10, 15, 60), e("cable_crunch", 3, 12, 15, 60)] },
  upper: { ex: [e("pullup", 3, 6, 10, 120), e("inc_bb_press", 3, 6, 8, 150), e("db_row", 3, 8, 10, 90), e("db_lat", 4, 12, 15, 60), e("rear_fly", 2, 15, 20, 60), e("ez_curl", 3, 8, 12, 75), e("skull", 3, 8, 12, 75)] },
  lower: { ex: [e("hack", 3, 8, 10, 150), e("seated_curl", 3, 10, 12, 75), e("lunge", 2, 10, 12, 90), e("calf_seat", 3, 12, 15, 60), e("dips", 3, 8, 12, 90), e("cable_curl", 3, 10, 12, 60), e("hlr", 3, 10, 15, 60)] },
};
// isoDow -> template. Padel (Mon-Wed mornings by default) stays compatible: upper body first, legs later in the week.
export const SCHEDULES: Record<4 | 5, Partial<Record<number, TplId>>> = {
  4: { 0: "push", 1: "pull", 3: "legs", 5: "upper" },
  5: { 0: "push", 1: "pull", 3: "legs", 4: "upper", 5: "lower" },
};

export interface DayInfo {
  key: DateKey; idx: number; dayNum: number; week: number; phase: Phase; spw: 4 | 5;
  weekInPhase: number; phaseWeeks: number; deload: boolean; tplId: TplId | null;
  padelPlanned: boolean; inProgram: boolean;
}

export function dayInfo(profile: Pick<Profile, "startDate" | "sessionsPerWeek" | "padelDays">, key: DateKey): DayInfo {
  const idx = diffDays(profile.startDate, key);
  const week = clamp(Math.floor(idx / 7) + 1, 1, 52);
  const phase = PHASES.find((p) => week >= p.weeks[0] && week <= p.weeks[1])!;
  const spw = (profile.sessionsPerWeek === "auto" ? (phase.id === 1 ? 4 : 5) : Number(profile.sessionsPerWeek)) as 4 | 5;
  return {
    key, idx, dayNum: idx + 1, week, phase, spw,
    weekInPhase: week - phase.weeks[0] + 1,
    phaseWeeks: phase.weeks[1] - phase.weeks[0] + 1,
    deload: phase.id < 5 && week === phase.weeks[1],
    tplId: SCHEDULES[spw][isoDow(key)] || null,
    padelPlanned: (profile.padelDays || []).includes(isoDow(key)),
    inProgram: idx >= 0 && idx < 365,
  };
}

export interface PlannedExercise { exId: string; sets: number; reps: [number, number]; rest: number }
export interface Workout {
  tplId: TplId; exercises: PlannedExercise[]; duration: number;
  /** "deload" or the phase id whose note applies */
  note: "deload" | number;
}

export function buildWorkout(info: DayInfo, tplId: TplId | null = info.tplId): Workout | null {
  if (!tplId) return null;
  const exercises = TEMPLATES[tplId].ex.map((x) => {
    const meta = EX[x.id];
    let sets = x.sets;
    if (info.phase.id === 1 && info.week <= 3) sets -= 1;
    if (info.phase.id === 3 && meta.iso) sets += 1;
    if (info.phase.id === 4 && FOCUS_P4.has(x.id)) sets += 1;
    if (info.deload) sets -= 1;
    return { exId: x.id, sets: clamp(sets, 2, 5), reps: x.reps, rest: x.rest };
  });
  const secs = exercises.reduce((s, x) => s + x.sets * (40 + x.rest), 0);
  return { tplId, exercises, duration: Math.round((secs / 60 + 8) / 5) * 5, note: info.deload ? "deload" : info.phase.id };
}

export const e1rm = (w: number, r: number) => (w > 0 ? w * (1 + r / 30) : 0);

export function lastPerformance(sessions: Session[], exId: string) {
  for (let i = sessions.length - 1; i >= 0; i--) {
    const ex = sessions[i].exercises.find((x) => x.exId === exId);
    if (ex && ex.sets.length) return { date: sessions[i].date, sets: ex.sets };
  }
  return null;
}

export function bestSetOf(sessions: Session[], exId: string) {
  let best: { w: number; r: number; date: DateKey } | null = null;
  sessions.forEach((s) => s.exercises.forEach((x) => {
    if (x.exId !== exId) return;
    x.sets.forEach((st) => {
      if (!best || e1rm(st.w, st.r) > e1rm(best.w, best.r) || (st.w === best.w && st.r > best.r)) best = { ...st, date: s.date };
    });
  }));
  return best as { w: number; r: number; date: DateKey } | null;
}

export type Target =
  | { kind: "first"; w: null; r: number; lo: number; hi: number }
  | { kind: "add" | "rep"; w: number; r: number };

// Progressive overload: beat the top of the range on every set -> add weight; otherwise add a rep.
export function targetFor(sessions: Session[], exId: string, reps: [number, number]): Target {
  const last = lastPerformance(sessions, exId);
  if (!last) return { kind: "first", w: null, r: reps[1], lo: reps[0], hi: reps[1] };
  const inc = EX[exId]?.inc || 2.5;
  const topW = Math.max(...last.sets.map((s) => s.w));
  const top = last.sets.filter((s) => s.w === topW);
  if (top.every((s) => s.r >= reps[1])) return { kind: "add", w: +(topW + inc).toFixed(2), r: reps[0] };
  const best = Math.max(...top.map((s) => s.r));
  return { kind: "rep", w: topW, r: Math.min(best + 1, reps[1]) };
}

/** Templates scheduled earlier this week that were not trained yet. */
export function missedThisWeek(profile: Profile, sessions: Session[], key: DateKey) {
  const ws = weekStartOf(key);
  const doneTpl = sessions.filter((s) => s.date >= ws && s.date <= key).map((s) => s.tplId);
  const out: TplId[] = [];
  for (let k = ws; k < key; k = addDays(k, 1)) {
    const inf = dayInfo(profile, k);
    if (inf.inProgram && inf.tplId && !doneTpl.includes(inf.tplId)) out.push(inf.tplId);
  }
  return out;
}
