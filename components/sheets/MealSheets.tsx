"use client";

import { useState } from "react";
import { Check, ChevronRight, RefreshCw } from "lucide-react";
import { dayNutrition, scaleMeal, swapOptions } from "@/lib/nutrition";
import type { Slot } from "@/lib/types";
import { useApp } from "@/components/shell/context";
import { Sheet, Stat } from "@/components/ui/primitives";
import { MealTile } from "@/components/nutrition/NutritionPage";

export function RecipeSheet({ dateKey, slot, onClose }: { dateKey: string; slot: string; onClose: () => void }) {
  const { state, actions, t, f } = useApp();
  const nut = dayNutrition(state, dateKey);
  const item = slot === "fuel" ? nut.fuel : nut.meals.find((m) => m.slot === slot);
  const [showSwap, setShowSwap] = useState(false);
  if (!item) return null;
  const m = item.meal;
  const copy = f.meal(m.id);
  const alts = slot === "fuel" ? [] : swapOptions(state.profile, slot as Slot, m.id).map((a) => scaleMeal(a, nut.factor));
  return (
    <Sheet title={t.slots[slot]} onClose={onClose} closeLabel={t.ui.close}>
      <h2 className="d up" style={{ fontSize: 40, fontWeight: 900, lineHeight: 0.92 }}>{copy.name}</h2>
      <div className="grid3" style={{ marginTop: 20 }}>
        <Stat v={f.num(m.kcal)} k={t.ui.calories} />
        <Stat v={Math.round(m.p)} unit="g" k={t.ui.protein} red />
        <Stat v={m.noCook && !m.prep ? "0" : m.prep} unit="min" k={t.ui.prep} />
      </div>
      <div className="mute n" style={{ fontSize: 13, marginTop: 12 }}>{t.ui.carbsFat(Math.round(m.c), Math.round(m.f))}</div>
      {copy.tip && <p style={{ marginTop: 14, fontSize: 14, borderLeft: "2px solid var(--red)", paddingLeft: 12 }}>{copy.tip}</p>}
      <div className="sec" style={{ marginTop: 24 }}>
        <h3 className="h3 d" style={{ marginBottom: 6 }}>{t.ui.ingredients}</h3>
        <table className="tbl"><tbody>{m.ing.map(([fid, q]) => (
          <tr key={fid}><td>{f.food(fid)}</td><td className="n" style={{ textAlign: "right", fontWeight: 700, whiteSpace: "nowrap" }}>{f.qty(fid, q)}</td></tr>
        ))}</tbody></table>
      </div>
      <div className="sec" style={{ marginTop: 22 }}>
        <h3 className="h3 d" style={{ marginBottom: 10 }}>{t.ui.instructions}</h3>
        <ol style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "grid", gap: 12 }}>
          {copy.steps.map((s, i) => <li key={i} className="row" style={{ alignItems: "flex-start" }}><span className="d n red" style={{ fontWeight: 900, fontSize: 20, width: 20, lineHeight: 1.1 }}>{i + 1}</span><span style={{ flex: 1 }}>{s}</span></li>)}
        </ol>
      </div>
      <div className="row" style={{ marginTop: 26, gap: 10 }}>
        {alts.length > 0 && <button className="btn ghost sm" style={{ flex: 1 }} onClick={() => setShowSwap(!showSwap)}><RefreshCw size={16} />{t.ui.swapMeal}</button>}
        <button className={`btn sm ${item.eaten ? "ghost" : ""}`} style={{ flex: 1 }} onClick={() => { actions.toggleMeal(dateKey, slot); if (!item.eaten) onClose(); }}>
          <Check size={17} strokeWidth={3} />{item.eaten ? t.ui.unmark : t.ui.markAsEaten}
        </button>
      </div>
      {showSwap && (
        <div style={{ marginTop: 16 }}>
          {alts.map((a) => (
            <button key={a.id} className="task" style={{ width: "100%", textAlign: "left" }} onClick={() => { actions.swapMeal(dateKey, slot, a.id); setShowSwap(false); }}>
              <MealTile meal={a} />
              <div className="tl"><div className="tt">{f.meal(a.id).name}</div><div className="ts">{t.ui.altLine(f.num(a.kcal), Math.round(a.p), a.noCook ? t.ui.noCooking : `${a.prep} min`)}</div></div>
              <ChevronRight size={18} />
            </button>
          ))}
          {item.swapped && <button className="lbl" style={{ marginTop: 10, textDecoration: "underline" }} onClick={() => { actions.swapMeal(dateKey, slot, null); setShowSwap(false); }}>{t.ui.backToPlanned}</button>}
        </div>
      )}
    </Sheet>
  );
}
