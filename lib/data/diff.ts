import type { Activity, ActiveWorkout, DayLog, Measurement, Photo, Profile, Session, State, WeeklyCheckin } from "../types";

/* Row-level diff between two app states. The sync layer pushes only what changed. */

export interface KeyedOps<T> { upsert: [string, T][]; del: string[] }
export interface ListOps<T> { upsert: T[]; del: string[] }
export interface Ops {
  profile: Profile | null;
  /** undefined: unchanged. null: cleared. */
  active: ActiveWorkout | null | undefined;
  days: KeyedOps<DayLog>;
  weights: KeyedOps<number>;
  checkins: KeyedOps<WeeklyCheckin>;
  sessions: ListOps<Session>;
  activities: ListOps<Activity>;
  measurements: ListOps<Measurement>;
  photos: ListOps<Photo>;
  ach: { add: string[]; del: string[] };
}

/** Key-order-insensitive JSON: Postgres jsonb reorders object keys, which must not count as a change. */
export const stable = (v: unknown): string =>
  Array.isArray(v) ? `[${v.map(stable).join(",")}]`
    : v && typeof v === "object" ? `{${Object.keys(v).sort().filter((k) => (v as Record<string, unknown>)[k] !== undefined).map((k) => `${JSON.stringify(k)}:${stable((v as Record<string, unknown>)[k])}`).join(",")}}`
    : JSON.stringify(v ?? null);
const same = (a: unknown, b: unknown) => stable(a) === stable(b);

function keyed<T>(prev: Record<string, T> = {}, next: Record<string, T> = {}): KeyedOps<T> {
  const upsert = Object.entries(next).filter(([k, v]) => !(k in prev) || !same(prev[k], v));
  const del = Object.keys(prev).filter((k) => !(k in next));
  return { upsert, del };
}

function list<T extends { id: string }>(prev: T[] = [], next: T[] = []): ListOps<T> {
  const pm = new Map(prev.map((x) => [x.id, x]));
  const nm = new Set(next.map((x) => x.id));
  return { upsert: next.filter((x) => !pm.has(x.id) || !same(pm.get(x.id), x)), del: [...pm.keys()].filter((id) => !nm.has(id)) };
}

/** prev = null means nothing exists remotely yet: everything in next is pushed. */
export function diffState(prev: State | null, next: State): Ops {
  const p = prev ?? ({} as Partial<State>);
  const prevAch = new Set(p.seenAch ?? []);
  const nextAch = new Set(next.seenAch);
  return {
    profile: !prev || !same(prev.profile, next.profile) ? next.profile : null,
    active: !prev ? next.active : same(prev.active, next.active) ? undefined : next.active,
    days: keyed(p.days, next.days),
    weights: keyed(p.weights, next.weights),
    checkins: keyed(p.checkins, next.checkins),
    sessions: list(p.sessions, next.sessions),
    activities: list(p.activities, next.activities),
    measurements: list(p.measurements, next.measurements),
    photos: list(p.photos, next.photos),
    ach: { add: [...nextAch].filter((x) => !prevAch.has(x)), del: [...prevAch].filter((x) => !nextAch.has(x)) },
  };
}

export function isEmpty(o: Ops) {
  const k = (x: { upsert: unknown[]; del: string[] }) => !x.upsert.length && !x.del.length;
  return !o.profile && o.active === undefined && k(o.days) && k(o.weights) && k(o.checkins) && k(o.sessions)
    && k(o.activities) && k(o.measurements) && k(o.photos) && !o.ach.add.length && !o.ach.del.length;
}
