"use client";

import { useState } from "react";
import { CartesianGrid, ComposedChart, Line, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from "recharts";
import { avg7At } from "@/lib/nutrition";
import { addDays, todayKey } from "@/lib/utils/date";
import { useApp } from "@/components/shell/context";
import { Dot, Seg } from "@/components/ui/primitives";

export function WeightChart() {
  const { state, t, f } = useApp();
  const [range, setRange] = useState<"30" | "90" | "all">("90");
  const keys = Object.keys(state.weights).sort();
  if (!keys.length) return <p className="mute">{t.ui.firstWeighIn}</p>;
  const tk = todayKey();
  const from = range === "all" ? keys[0] : [keys[0], addDays(tk, -Number(range) + 1)].sort()[1];
  const data = [];
  for (let k = from; k <= tk; k = addDays(k, 1)) {
    const a = avg7At(state.weights, k);
    data.push({ d: f.short(k), w: state.weights[k] ?? null, a: a != null ? +a.toFixed(2) : null });
  }
  return (
    <div>
      <div style={{ maxWidth: 300, marginBottom: 12 }}><Seg value={range} onChange={setRange} options={[["30", t.ui.d30], ["90", t.ui.d90], ["all", t.ui.all]]} /></div>
      <div style={{ height: 240, marginLeft: -18 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#1a1a1a" vertical={false} />
            <XAxis dataKey="d" tick={{ fill: "#5a5853", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#222" }} minTickGap={28} />
            <YAxis domain={["dataMin - 0.8", "dataMax + 0.8"]} tick={{ fill: "#5a5853", fontSize: 11 }} tickLine={false} axisLine={false} width={44} tickFormatter={(v: number) => f.dec(v)} />
            <Tooltip contentStyle={{ background: "#151515", border: "1px solid #2c2c2c", borderRadius: 3, fontSize: 13 }} labelStyle={{ color: "#8d8a84" }}
              formatter={(v, n) => [`${f.dec(Number(v))} kg`, n === "a" ? t.ui.avg7 : t.ui.daily]} />
            <Scatter dataKey="w" fill="#5a5853" />
            <Line dataKey="a" stroke="#e8291c" strokeWidth={2.5} dot={false} connectNulls isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="row" style={{ gap: 16, marginTop: 8 }}>
        <span className="lbl row" style={{ gap: 6 }}><Dot size={7} color="#5a5853" />{t.ui.dailyWeight}</span>
        <span className="lbl row" style={{ gap: 6 }}><span style={{ width: 14, height: 2.5, background: "var(--red)" }} />{t.ui.avg7Long}</span>
      </div>
    </div>
  );
}
