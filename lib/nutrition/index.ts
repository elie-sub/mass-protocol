import { addDays, avg, clamp, diffDays, type DateKey } from "../utils/date";
import type { ActType, Activity, Intensity, Profile, Slot, State } from "../types";
import { FOODS, FUEL, INT_FOODS, MEALS, type Ing, type LibSlot, type MealDef } from "./data";

export * from "./data";

export interface Macros { kcal: number; p: number; c: number; f: number }
export type ScaledMeal = MealDef & Macros;

export const ZERO: Macros = { kcal: 0, p: 0, c: 0, f: 0 };
export const addM = (a: Macros, b: Macros): Macros => ({ kcal: a.kcal + b.kcal, p: a.p + b.p, c: a.c + b.c, f: a.f + b.f });

export const macrosOf = (fid: string, q: number): Macros => {
  const f = FOODS[fid];
  const k = f[0] === "g" || f[0] === "ml" ? q / 100 : q;
  return { kcal: f[1] * k, p: f[2] * k, c: f[3] * k, f: f[4] * k };
};
export const sumMacros = (ing: Ing[]) => ing.reduce((a, [fid, q]) => addM(a, macrosOf(fid, q)), ZERO);

const RAW: Record<string, Macros> = Object.fromEntries([...MEALS, FUEL].map((m) => [m.id, sumMacros(m.ing)]));
export const rawOf = (id: string) => RAW[id];
export const MEAL_BY_ID: Record<string, MealDef> = Object.fromEntries([...MEALS, FUEL].map((m) => [m.id, m]));

export function roundQty(fid: string, q: number) {
  const u = FOODS[fid][0];
  if (u === "g" || u === "ml") return q < 40 ? Math.max(5, Math.round(q / 5) * 5) : Math.round(q / 10) * 10;
  if (INT_FOODS.has(fid) || u === "slice" || u === "tbsp") return Math.max(1, Math.round(q));
  return Math.max(0.5, Math.round(q * 2) / 2);
}

export function scaleMeal(meal: MealDef, f: number): ScaledMeal {
  const ing = meal.ing.map(([fid, q]) => [fid, roundQty(fid, q * f)] as Ing);
  return { ...meal, ing, ...sumMacros(ing) };
}

export const SLOTS: Slot[] = ["breakfast", "snack1", "lunch", "snack2", "dinner", "prebed"];
export const libFor = (slot: Slot): LibSlot => (slot === "snack1" || slot === "snack2" ? "snack" : slot);

export function filteredLib(prefs: Partial<Profile["prefs"]> = {}) {
  const lib = {} as Record<Exclude<LibSlot, "fuel">, MealDef[]>;
  (["breakfast", "snack", "lunch", "dinner", "prebed"] as const).forEach((s) => {
    const all = MEALS.filter((m) => m.slot === s);
    let l = all.filter((m) => !(prefs.noFish && m.tags.includes("fish")) && !(prefs.noPork && m.tags.includes("pork")));
    if (prefs.noCook) { const nc = l.filter((m) => m.noCook); if (nc.length) l = nc; }
    lib[s] = l.length ? l : all;
  });
  return lib;
}
const pickAt = <T,>(arr: T[], i: number) => arr[((i % arr.length) + arr.length) % arr.length];

export function planMealIds(profile: Profile, key: DateKey): Record<Slot, string> {
  const i = Math.max(0, diffDays(profile.startDate, key));
  const lib = filteredLib(profile.prefs);
  return {
    breakfast: pickAt(lib.breakfast, i).id, snack1: pickAt(lib.snack, i).id, lunch: pickAt(lib.lunch, i).id,
    snack2: pickAt(lib.snack, i + 3).id, dinner: pickAt(lib.dinner, i + 2).id, prebed: pickAt(lib.prebed, i).id,
  };
}

export const ACT_RATES: Record<ActType, Record<Intensity, number>> = {
  padel: { low: 3.5, medium: 5, high: 6.5 },
  run: { low: 7, medium: 9, high: 11 },
  crossfit: { low: 5, medium: 7, high: 9 },
  other: { low: 3, medium: 4.5, high: 6 },
};
export const ACT_TYPES = Object.keys(ACT_RATES) as ActType[];
export const activityKcal = (a: Pick<Activity, "type" | "duration" | "intensity">) => a.duration * (ACT_RATES[a.type]?.[a.intensity] || 4);
// Rough extra energy above baseline. Tracking aid only, not a measurement.
export const activityBonus = (activities: Activity[], key: DateKey) =>
  activities.filter((a) => a.date === key).reduce((s, a) => s + activityKcal(a), 0);

export function avg7At(weights: Record<DateKey, number>, key: DateKey) {
  const from = addDays(key, -6);
  return avg(Object.entries(weights).filter(([k]) => k >= from && k <= key).map(([, w]) => w));
}
export function weightAt(state: Pick<State, "weights" | "profile">, key: DateKey) {
  const ks = Object.keys(state.weights).filter((k) => k <= key).sort();
  if (!ks.length) return state.profile.startWeight;
  return avg7At(state.weights, ks[ks.length - 1])!;
}

export function baseTargets(profile: Profile, w: number): Macros {
  if (profile.nutritionMode === "manual") { const m = profile.manual; return { kcal: m.kcal, p: m.protein, c: m.carbs, f: m.fat }; }
  const bmr = 10 * w + 6.25 * profile.heightCm - 5 * profile.age + 5;
  const kcal = Math.round((bmr * profile.activity + profile.surplus + profile.kcalAdjust) / 50) * 50;
  const p = Math.round((w * profile.proteinPerKg) / 5) * 5;
  const f = Math.round((kcal * 0.27) / 9 / 5) * 5;
  const c = Math.max(0, Math.round((kcal - p * 4 - f * 9) / 4 / 5) * 5);
  return { kcal, p, c, f };
}

export interface MealItem { slot: Slot | "fuel"; meal: ScaledMeal; eaten: boolean; swapped?: boolean }
export interface DayNutrition {
  base: Macros; bonus: number; target: Macros; meals: MealItem[]; fuel: MealItem | null;
  consumed: Macros; factor: number; highActivity: boolean;
}

export function dayNutrition(state: State, key: DateKey): DayNutrition {
  const { profile } = state;
  const base = baseTargets(profile, weightAt(state, key));
  const bonus = Math.round(activityBonus(state.activities, key) / 50) * 50;
  const ids = planMealIds(profile, key);
  const dm = state.days[key]?.meals || {};
  const planned = SLOTS.reduce((s, sl) => s + RAW[ids[sl]].kcal, 0);
  const f = clamp(base.kcal / planned, 0.7, 1.4);
  const meals: MealItem[] = SLOTS.map((slot) => {
    const sw = dm[slot]?.swap;
    const id = sw && MEAL_BY_ID[sw] ? sw : ids[slot];
    return { slot, meal: scaleMeal(MEAL_BY_ID[id], f), eaten: !!dm[slot]?.eaten, swapped: id !== ids[slot] };
  });
  const fuel = bonus >= 250 ? { slot: "fuel" as const, meal: scaleMeal(FUEL, clamp(bonus / RAW[FUEL.id].kcal, 0.6, 2.2)), eaten: !!dm.fuel?.eaten } : null;
  const target = { kcal: base.kcal + bonus, p: base.p, c: base.c + Math.round((bonus * 0.8) / 4), f: base.f + Math.round((bonus * 0.2) / 9) };
  let consumed = ZERO;
  [...meals, ...(fuel ? [fuel] : [])].forEach((m) => { if (m.eaten) consumed = addM(consumed, m.meal); });
  (state.days[key]?.extras || []).forEach((x) => { consumed = addM(consumed, { kcal: x.kcal, p: x.p, c: x.c || 0, f: x.f || 0 }); });
  return { base, bonus, target, meals, fuel, consumed, factor: f, highActivity: bonus >= 400 };
}

export function swapOptions(profile: Profile, slot: Slot, currentId: string) {
  const cur = RAW[currentId];
  const lib = filteredLib(profile.prefs)[libFor(slot) as Exclude<LibSlot, "fuel">].filter((m) => m.id !== currentId);
  return lib.map((m) => ({ m, d: Math.abs(RAW[m.id].kcal - cur.kcal) / cur.kcal + Math.abs(RAW[m.id].p - cur.p) / Math.max(cur.p, 1) }))
    .sort((a, b) => a.d - b.d).slice(0, 3).map((x) => x.m);
}
