import en, { type Dict } from "./en";
import fr from "./fr";
import { isoDow, pad, parseKey, type DateKey } from "../utils/date";
import { FOODS } from "../nutrition/data";
import type { Target } from "../program";
import type { Task } from "../metrics";
import type { Lang, PrEntry, Session } from "../types";

export type { Dict };
export const DICTS: Record<Lang, Dict> = { en, fr };

function build(t: Dict) {
  const num = (n: number) => Math.round(n).toLocaleString(t.locale);
  const fr = t.locale === "fr-FR";
  const loc = (s: string) => (fr ? s.replace(".", ",") : s);
  const kgNum = (n: number) => loc(String(n));
  const f = {
    date: (k: DateKey) => { const d = parseKey(k); return t.fmtDate(t.dow[isoDow(k)], d.getDate(), t.months[d.getMonth()]); },
    short: (k: DateKey) => { const d = parseKey(k); return `${d.getDate()} ${t.monthsShort[d.getMonth()]}`; },
    num,
    /** one-decimal number, locale decimal separator */
    dec: (n: number, digits = 1) => loc(n.toFixed(digits)),
    kg: (n: number | null | undefined, sign = false) => (n == null ? "–" : `${sign && n > 0 ? "+" : ""}${loc(n.toFixed(1))}`),
    w: kgNum,
    dur: (ms: number) => { const m = Math.floor(ms / 60000); return m >= 60 ? t.ui.durH(Math.floor(m / 60), pad(m % 60)) : t.ui.durMin(m); },
    clock: (s: number) => `${Math.floor(s / 60)}:${pad(Math.max(0, s % 60))}`,
    rest: (s: number) => (s >= 120 ? t.ui.durMin(kgNum(s / 60)) : t.ui.restSec(s)),
    qty: (fid: string, q: number) => {
      const u = FOODS[fid][0];
      if (u === "g") return `${kgNum(q)} g`;
      if (u === "ml") return `${kgNum(q)} ml`;
      if (u === "slice") return t.qty.slice(q);
      if (u === "tbsp") return `${q} ${t.qty.tbsp}`;
      return q % 1 === 0.5 ? `${Math.floor(q) || ""}½` : `${q}`;
    },
    food: (fid: string) => t.foods[fid] ?? fid,
    exName: (id: string) => t.ex[id]?.[0] ?? id,
    exMuscle: (id: string) => t.ex[id]?.[1] ?? "",
    meal: (id: string) => t.meals[id] ?? { name: id, steps: [] },
    tplName: (tplId: string | null | undefined, fallback = "") => (tplId && t.tpl[tplId]?.name) || fallback,
    sessName: (s: Pick<Session, "tplId" | "name">) => (s.tplId && t.tpl[s.tplId]?.name) || s.name,
    phase: (id: number) => t.phases[id],
    target: (x: Target) => (x.kind === "first" ? t.target.first(x.lo, x.hi) : x.kind === "add" ? t.target.add(kgNum(x.w), x.r) : t.target.rep(kgNum(x.w), x.r)),
    pr: (p: PrEntry) => (typeof p === "string" ? p : `${t.ex[p.exId]?.[0] ?? p.exId}${fr ? " :" : ":"} ${kgNum(p.w)} kg × ${p.r}`),
    answer: (v: string) => t.answers[v] ?? v,
    taskLabel: (task: Task) => {
      switch (task.id) {
        case "weigh": return t.task.weigh;
        case "water": return t.task.water(task.waterL!);
        case "creatine": return t.task.creatine;
        case "gym": return t.task.gym(task.session ? f.sessName(task.session) : f.tplName(task.workout!.tplId));
        case "protein": return t.task.protein(task.target!);
        case "kcal": return t.task.kcal(num(task.target!));
        case "checkin": return t.task.checkin;
        case "shop": return t.task.shop;
        default: return t.slots[task.labelKey || task.slot!] ?? task.id;
      }
    },
    taskSub: (task: Task) => {
      switch (task.id) {
        case "weigh": return task.weight != null ? `${kgNum(task.weight)} kg` : t.task.weighSub;
        case "water": return t.task.waterSub;
        case "creatine": return t.task.creatineSub;
        case "gym": return task.session ? t.task.gymDone(task.session.sets, num(task.session.volume)) : t.task.gymPlan(task.workout!.duration, t.tpl[task.workout!.tplId].focus);
        case "meal:fuel": return t.task.fuelSub(num(task.kcal!));
        case "protein": return t.task.proteinSub(Math.round(task.consumed!));
        case "kcal": return t.task.kcalSub(num(task.consumed!));
        case "shop": return t.task.shopSub(t.dow[isoDow(task.tripEnd!)].toLowerCase());
        case "checkin": return task.checkin ? t.task.checkinDone(f.answer(task.checkin.energy), task.checkin.note) : t.task.checkinSub;
        default: return t.task.mealSub(f.meal(task.mealId!).name, num(task.kcal!));
      }
    },
  };
  return { t, f };
}

/** V1 stored weekly suggestions as English text: recover the code so they display in the current language. */
export function suggestionCodeOf(text: string): { code: string; adh: number } | null {
  const adh = Number(text.match(/(\d+)%/)?.[1] ?? 0);
  const hit = Object.entries(en.suggestion).find(([, fn]) => fn(adh) === text);
  return hit ? { code: hit[0], adh } : null;
}

const CACHE: Partial<Record<Lang, ReturnType<typeof build>>> = {};
export function i18n(lang: Lang = "fr") {
  const l = DICTS[lang] ? lang : "fr";
  return (CACHE[l] ??= build(DICTS[l]));
}
export type I18n = ReturnType<typeof i18n>;
