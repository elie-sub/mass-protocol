"use client";

import { useState } from "react";
import { Check, ChevronLeft } from "lucide-react";
import { FOODS } from "@/lib/nutrition";
import { AISLES, nextTrip, shoppingList, tripFor, type Trip } from "@/lib/nutrition/shopping";
import { isoDow, todayKey } from "@/lib/utils/date";
import { useApp } from "@/components/shell/context";
import { Bar, Seg } from "@/components/ui/primitives";

/** Shopping list per trip (e.g. Monday covers Mon–Wed, Thursday covers Thu–Sun), grouped by aisle, checkable in store. */
export function GroceriesPage() {
  const { state, actions, setTab, t, f } = useApp();
  const tk = todayKey();
  const current = tripFor(state.profile, tk);
  const upcoming = nextTrip(state.profile, current);
  // On a shopping day show today's trip; otherwise plan the next one.
  const [which, setWhich] = useState<"cur" | "next">(current.start === tk ? "cur" : "next");
  const trip: Trip = which === "cur" ? current : upcoming;
  const items = shoppingList(state, trip);
  const inCart = new Set(state.days[trip.start]?.shopping || []);
  const done = items.filter((x) => inCart.has(x.fid)).length;
  const tab = (tr: Trip) => t.ui.tripTab(t.dow3[isoDow(tr.start)], f.short(tr.start));

  const qty = (fid: string, q: number) => {
    const u = FOODS[fid][0];
    if (u === "g") return q >= 1000 ? `${f.dec(q / 1000)} kg` : `${Math.round(q / 10) * 10 || Math.round(q)} g`;
    if (u === "ml") return q >= 1000 ? `${f.dec(q / 1000)} L` : `${Math.round(q / 10) * 10} ml`;
    if (u === "slice") return t.qty.slice(Math.ceil(q));
    if (u === "tbsp") return `${Math.ceil(q)} ${t.qty.tbsp}`;
    return `${Math.ceil(q)}`;
  };

  return (
    <div className="wrap" style={{ maxWidth: 720 }}>
      <button className="chip" onClick={() => setTab("nutrition")}><ChevronLeft size={13} />{t.ui.backToNutrition}</button>
      <div className="lbl" style={{ marginTop: 16 }}>{t.ui.shopList}</div>
      <h1 className="h1 d" style={{ marginTop: 6 }}>{t.ui.groceries}</h1>
      <div style={{ marginTop: 18, maxWidth: 420 }}>
        <Seg value={which} onChange={setWhich} options={[["cur", tab(current)], ["next", tab(upcoming)]]} />
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="between">
          <div>
            <div className="h3 d">{t.ui.tripCovers(f.date(trip.start).toLowerCase(), f.date(trip.end).toLowerCase())}</div>
            <div className="lbl" style={{ marginTop: 4 }}>{t.ui.inCart(done, items.length)}</div>
          </div>
          <div className="d n" style={{ fontSize: 30, fontWeight: 900 }}>{items.length ? Math.round((done / items.length) * 100) : 0}%</div>
        </div>
        <div style={{ marginTop: 12 }}><Bar v={done} max={items.length} /></div>
      </div>

      {!items.length && <p className="mute" style={{ marginTop: 18 }}>{t.ui.emptyTrip}</p>}
      {AISLES.map((aisle) => {
        const rows = items.filter((x) => x.aisle === aisle).sort((a, b) => f.food(a.fid).localeCompare(f.food(b.fid), t.locale));
        if (!rows.length) return null;
        return (
          <div key={aisle}>
            <div className="secname between"><span>{t.aisles[aisle]}</span><span className="n">{rows.filter((x) => inCart.has(x.fid)).length}/{rows.length}</span></div>
            {rows.map((x) => {
              const on = inCart.has(x.fid);
              return (
                <button key={x.fid} className={`task ${on ? "done" : ""}`} style={{ width: "100%", textAlign: "left" }} onClick={() => actions.toggleShopItem(trip.start, x.fid)}>
                  <span className={`chk ${on ? "on" : ""}`}>{on && <Check size={17} strokeWidth={3} color="#fff" />}</span>
                  <div className="tl"><div className="tt">{f.food(x.fid)}</div></div>
                  <span className="d n" style={{ fontSize: 20, fontWeight: 800, whiteSpace: "nowrap", color: on ? "var(--dim)" : undefined }}>{qty(x.fid, x.qty)}</span>
                </button>
              );
            })}
          </div>
        );
      })}

      <p className="lbl" style={{ marginTop: 22 }}>{t.ui.shopNote}</p>
      {done > 0 && <button className="lbl" style={{ marginTop: 12, textDecoration: "underline" }} onClick={() => actions.clearShopping(trip.start)}>{t.ui.uncheckAll}</button>}
    </div>
  );
}
