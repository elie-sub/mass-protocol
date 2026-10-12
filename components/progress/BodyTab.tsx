"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { todayKey } from "@/lib/utils/date";
import type { MeasKey, Measurement } from "@/lib/types";
import { useApp } from "@/components/shell/context";
import { Field, SecH } from "@/components/ui/primitives";

const MEAS: MeasKey[] = ["chest", "waist", "arms", "thighs", "shoulders"];

export function BodyTab() {
  const { state, actions, t, f } = useApp();
  const [v, setV] = useState<Partial<Record<MeasKey, string>>>({});
  const list = [...state.measurements].sort((a, b) => a.date.localeCompare(b.date));
  const first = list[0];
  const ok = MEAS.some((k) => Number(v[k]) > 0);
  const save = () => {
    const m: Omit<Measurement, "id"> = { date: todayKey() };
    MEAS.forEach((k) => { if (Number(v[k]) > 0) m[k] = Number(v[k]); });
    actions.addMeasurement(m);
    setV({});
  };
  return (
    <div className="two">
      <div className="card">
        <h2 className="h3 d">{t.ui.logMeas}</h2>
        <p className="lbl" style={{ marginTop: 4 }}>{t.ui.measSub}</p>
        <div className="grid2" style={{ marginTop: 16 }}>
          {MEAS.map((k) => <Field key={k} label={t.meas[k]}><input inputMode="decimal" value={v[k] || ""} onChange={(e) => setV({ ...v, [k]: e.target.value.replace(",", ".") })} placeholder={t.ui.cm} /></Field>)}
        </div>
        <button className="btn" style={{ marginTop: 16 }} disabled={!ok} onClick={save}>{t.ui.saveMeas}</button>
      </div>
      <div>
        <SecH title={t.ui.history} />
        {list.length ? <div className="scroll-x"><table className="tbl n">
          <thead><tr><th>{t.ui.date}</th>{MEAS.map((k) => <th key={k}>{t.meas[k]}</th>)}<th /></tr></thead>
          <tbody>{[...list].reverse().map((m) => (
            <tr key={m.id}><td style={{ whiteSpace: "nowrap" }}>{f.short(m.date)}</td>
              {MEAS.map((k) => {
                const val = m[k], base = first[k];
                return (
                  <td key={k}>{val != null ? f.w(val) : "–"}
                    {val && base && m.id !== first.id && <div className={val - base >= 0 ? "red" : "mute"} style={{ fontSize: 11 }}>{val - base >= 0 ? "+" : ""}{f.dec(val - base)}</div>}
                  </td>
                );
              })}
              <td><button className="ib" style={{ width: 32, height: 32 }} onClick={() => actions.removeMeasurement(m.id)} aria-label={t.ui.delete}><Trash2 size={15} /></button></td></tr>
          ))}</tbody>
        </table></div> : <p className="mute">{t.ui.noMeas}</p>}
      </div>
    </div>
  );
}
