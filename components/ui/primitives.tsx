"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";
import { Minus, Plus, X } from "lucide-react";
import { clamp } from "@/lib/utils/date";

export function Ring({ pct, size = 132, stroke = 7, children }: { pct: number; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--s3)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--red)" strokeWidth={stroke} fill="none" strokeDasharray={c}
          strokeDashoffset={c * (1 - clamp(pct, 0, 100) / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1)" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
}

export const Bar = ({ v, max, white }: { v: number; max: number; white?: boolean }) => (
  <div className={`bar ${white ? "w" : ""}`}><i style={{ width: `${clamp(max ? (v / max) * 100 : 0, 0, 100)}%` }} /></div>
);

export const Stat = ({ v, k, lg, red, unit }: { v: ReactNode; k: ReactNode; lg?: boolean; red?: boolean; unit?: string }) => (
  <div className={`stat ${lg ? "lg" : ""}`}>
    <div className={`v d n ${red ? "red" : ""}`}>{v}{unit && <span style={{ fontSize: "0.42em", marginLeft: 3, color: "var(--mute)" }}>{unit}</span>}</div>
    <div className="k">{k}</div>
  </div>
);

export function Sheet({ title, onClose, children, closeLabel = "Close" }: { title: ReactNode; onClose: () => void; children: ReactNode; closeLabel?: string }) {
  useEffect(() => {
    const f = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [onClose]);
  return (
    <div className="ov" onClick={onClose} role="dialog" aria-modal="true">
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-h"><div className="h3 d">{title}</div><button className="ib" onClick={onClose} aria-label={closeLabel}><X size={20} /></button></div>
        <div className="sheet-b">{children}</div>
      </div>
    </div>
  );
}

type OptVal = string | number | boolean;
export function Opt<V extends OptVal>({ value, options, onChange }: { value: V; options: (V | [V, string])[]; onChange: (v: V) => void }) {
  return (
    <div className="opt">{options.map((o) => {
      const [v, l]: [V, string] = Array.isArray(o) ? o : [o, String(o)];
      return <button key={String(v)} className={value === v ? "on" : ""} onClick={() => onChange(v)}>{l}</button>;
    })}</div>
  );
}

export function Seg<V extends string>({ value, options, onChange }: { value: V; options: [V, string][]; onChange: (v: V) => void }) {
  return <div className="seg">{options.map(([v, l]) => <button key={v} className={value === v ? "on" : ""} onClick={() => onChange(v)}>{l}</button>)}</div>;
}

export const Field = ({ label, children }: { label: ReactNode; children: ReactNode }) => <label className="field"><span>{label}</span>{children}</label>;
export const SecH = ({ title, right }: { title: ReactNode; right?: ReactNode }) => <div className="sec-h"><h2 className="h2 d">{title}</h2>{right}</div>;

export function Stepper({ value, onChange, step, label, decLabel, incLabel }: {
  value: string | number; onChange: (v: string) => void; step: number; label: string; decLabel: string; incLabel: string;
}) {
  const num = value === "" || value == null ? null : Number(value);
  const bump = (d: number) => onChange(String(Math.max(0, +((num ?? 0) + d).toFixed(2))));
  return (
    <div style={{ flex: 1 }}>
      <div className="lbl" style={{ marginBottom: 6 }}>{label}</div>
      <div className="stepper">
        <button onClick={() => bump(-step)} aria-label={decLabel}><Minus size={18} /></button>
        <input inputMode="decimal" value={value ?? ""} onChange={(e) => onChange(e.target.value.replace(",", "."))} aria-label={label} />
        <button onClick={() => bump(step)} aria-label={incLabel}><Plus size={18} /></button>
      </div>
    </div>
  );
}

export const Dot = ({ size = 6, color, style }: { size?: number; color: string; style?: CSSProperties }) => (
  <span style={{ width: size, height: size, borderRadius: size / 2, background: color, display: "inline-block", ...style }} />
);
