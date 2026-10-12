"use client";

import { useMemo, useState } from "react";
import { Check, ChevronRight, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { dayNutrition, type MealItem, type ScaledMeal } from "@/lib/nutrition";
import { dayInfo } from "@/lib/program";
import { sessionOn } from "@/lib/metrics";
import { addDays, todayKey } from "@/lib/utils/date";
import { isShopDay, tripFor } from "@/lib/nutrition/shopping";
import { useApp } from "@/components/shell/context";
import { DayNav, MacroBars } from "@/components/ui/blocks";

export const MealTile = ({ meal }: { meal: ScaledMeal }) => {
  const { t } = useApp();
  return <div className="tile"><b className="n">{Math.round(meal.p)}</b><span>{t.ui.prot}</span></div>;
};

function MealCard({ dateKey, item, label }: { dateKey: string; item: MealItem; label: string }) {
  const { actions, open, t, f } = useApp();
  const m = item.meal;
  return (
    <div className="meal" style={{ borderColor: item.eaten ? "rgba(232,41,28,.35)" : undefined }}>
      <MealTile meal={m} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="lbl">{label}{m.noCook ? `. ${t.ui.noCooking}` : m.prep ? `. ${m.prep} min` : ""}</div>
        <button className="h3 d" style={{ marginTop: 3, textAlign: "left", fontSize: 21 }} onClick={() => open("recipe", { key: dateKey, slot: item.slot })}>{f.meal(m.id).name}</button>
        <div className="mute n" style={{ fontSize: 13, marginTop: 4 }}>{t.ui.macroLine(f.num(m.kcal), Math.round(m.p), Math.round(m.c), Math.round(m.f))}</div>
        <div className="row" style={{ marginTop: 12, gap: 8 }}>
          <button className="btn xs ghost" onClick={() => open("recipe", { key: dateKey, slot: item.slot })}>{t.ui.recipe}</button>
          <button className={`btn xs ${item.eaten ? "" : "ghost"}`} onClick={() => actions.toggleMeal(dateKey, item.slot)}><Check size={15} strokeWidth={3} />{item.eaten ? t.ui.eaten : t.ui.markEaten}</button>
        </div>
      </div>
    </div>
  );
}

function QuickAdd({ dateKey }: { dateKey: string }) {
  const { state, actions, t, f } = useApp();
  const [v, setV] = useState({ label: "", kcal: "", p: "" });
  const extras = state.days[dateKey]?.extras || [];
  const ok = v.label && Number(v.kcal) > 0;
  return (
    <div>
      {extras.map((x) => (
        <div key={x.id} className="task"><div className="tl"><div className="tt">{x.label}</div><div className="ts">{t.ui.extraLine(f.num(x.kcal), x.p)}</div></div>
          <button className="ib" onClick={() => actions.removeExtra(dateKey, x.id)} aria-label={t.ui.remove}><Trash2 size={17} /></button></div>
      ))}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8, marginTop: 10 }}>
        <input placeholder={t.ui.offPlan} value={v.label} onChange={(e) => setV({ ...v, label: e.target.value })} />
        <input placeholder={t.ui.kcal} inputMode="numeric" value={v.kcal} onChange={(e) => setV({ ...v, kcal: e.target.value })} />
        <input placeholder={t.ui.protG} inputMode="numeric" value={v.p} onChange={(e) => setV({ ...v, p: e.target.value })} />
      </div>
      <button className="btn sm ghost" style={{ width: "100%", marginTop: 8 }} disabled={!ok}
        onClick={() => { actions.addExtra(dateKey, { label: v.label, kcal: Number(v.kcal), p: Number(v.p) || 0 }); setV({ label: "", kcal: "", p: "" }); }}>
        <Plus size={16} />{t.ui.addFood}
      </button>
    </div>
  );
}

export function NutritionPage() {
  const { state, setTab, t, f } = useApp();
  const [k, setK] = useState(todayKey());
  const tk = todayKey();
  const nextShop = isShopDay(state.profile, tk) ? t.ui.today.toLowerCase() : f.date(addDays(tripFor(state.profile, tk).end, 1)).toLowerCase();
  const nut = useMemo(() => dayNutrition(state, k), [state, k]);
  const training = !!dayInfo(state.profile, k).tplId || !!sessionOn(state, k);
  const items = [...nut.meals, ...(nut.fuel ? [nut.fuel] : [])];
  return (
    <div className="wrap">
      <div className="between" style={{ flexWrap: "wrap" }}>
        <div><div className="lbl">{f.date(k)}</div><h1 className="h1 d" style={{ marginTop: 6 }}>{t.ui.nutrition}</h1></div>
        <DayNav k={k} setK={setK} />
      </div>
      <div className="two" style={{ marginTop: 22 }}>
        <div className="stack" style={{ gap: 10 }}>
          {items.map((it) => <MealCard key={it.slot} dateKey={k} item={it} label={it.slot === "snack2" && training ? t.postWorkout : t.slots[it.slot]} />)}
        </div>
        <div className="stack">
          <div className="card">
            <h2 className="h3 d" style={{ marginBottom: 16 }}>{t.ui.dailyTarget}</h2>
            <MacroBars nut={nut} big />
            {nut.bonus > 0 && <p className="lbl" style={{ marginTop: 14 }}>{t.ui.includesBonus(f.num(nut.bonus))}</p>}
          </div>
          <div className="card">
            <h2 className="h3 d" style={{ marginBottom: 4 }}>{t.ui.ateElse}</h2>
            <p className="lbl">{t.ui.ateElseSub}</p>
            <QuickAdd dateKey={k} />
          </div>
          <button className="card" style={{ textAlign: "left" }} onClick={() => setTab("groceries")}>
            <div className="between">
              <div className="row"><ShoppingBasket size={20} color="var(--red)" /><div><div className="h3 d">{t.ui.groceries}</div><div className="lbl">{t.ui.groceriesSub(nextShop)}</div></div></div>
              <ChevronRight size={20} />
            </div>
          </button>
          <p className="lbl">{t.ui.portionsNote}</p>
        </div>
      </div>
    </div>
  );
}
