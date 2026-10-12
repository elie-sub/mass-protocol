"use client";

import { useEffect, type ReactNode } from "react";
import type { Dict } from "@/lib/i18n";

export function Splash({ ready, onEnter, t, children }: { ready: boolean; onEnter?: () => void; t: Dict; children?: ReactNode }) {
  return (
    <div className="splash mp" onClick={() => ready && onEnter?.()}>
      <div className="d up s1">Elie</div>
      <div className="d up s2">{t.ui.massProtocol}</div>
      <div style={{ marginTop: 40, color: "var(--mute)", fontSize: 16, lineHeight: 1.6 }}>{t.ui.splashLine1}<br />{t.ui.splashLine2}</div>
      {children ?? (
        <button className="btn" style={{ marginTop: 40, maxWidth: 320, opacity: ready ? 1 : 0.4 }} onClick={(e) => { e.stopPropagation(); if (ready) onEnter?.(); }}>
          {ready ? t.ui.enter : t.ui.loading}
        </button>
      )}
    </div>
  );
}

export function DayComplete({ dayNum, onClose, t }: { dayNum: number; onClose: () => void; t: Dict }) {
  useEffect(() => { const tm = setTimeout(onClose, 4200); return () => clearTimeout(tm); }, [onClose]);
  return (
    <div className="complete mp" onClick={onClose}>
      <div className="d up" style={{ fontSize: 30, fontWeight: 900, letterSpacing: ".08em" }}>{t.ui.dayComplete}</div>
      <div className="d big n">100%</div>
      <div className="d up" style={{ fontSize: 24, fontWeight: 800, color: "var(--mute)", marginTop: 18, lineHeight: 1.15 }}>{t.ui.dayDone(dayNum)}<br />{t.ui.toGo(365 - dayNum)}</div>
    </div>
  );
}
