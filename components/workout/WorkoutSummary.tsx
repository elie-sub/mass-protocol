"use client";

import { Trophy } from "lucide-react";
import type { Session } from "@/lib/types";
import { useApp } from "@/components/shell/context";
import { Stat } from "@/components/ui/primitives";

export function WorkoutSummary({ s, onDone }: { s: Session; onDone: () => void }) {
  const { t, f } = useApp();
  return (
    <div className="complete mp" style={{ background: "var(--bg)", zIndex: 96 }}>
      <div className="d up" style={{ fontSize: 22, fontWeight: 800, letterSpacing: ".12em", color: "var(--mute)" }}>{f.sessName(s)}</div>
      <div className="d up" style={{ fontSize: "clamp(56px, 16vw, 110px)", fontWeight: 900, lineHeight: 0.85, marginTop: 10, animation: "slam .6s cubic-bezier(.2,1.4,.4,1)" }}>
        {t.ui.workout}<br /><span className="red">{t.ui.complete}</span>
      </div>
      <div className="grid2" style={{ marginTop: 34, gap: 28, maxWidth: 420, width: "100%", textAlign: "left" }}>
        <Stat v={f.dur(s.endedAt - s.startedAt)} k={t.ui.duration} />
        <Stat v={s.sets} k={t.ui.totalSets} />
        <Stat v={f.num(s.volume)} unit="kg" k={t.ui.totalVolume} />
        <Stat v={s.prs} k={t.ui.newPrs} red={s.prs > 0} />
      </div>
      {s.prList?.length > 0 && (
        <div style={{ marginTop: 22, maxWidth: 420, width: "100%", textAlign: "left" }}>
          {s.prList.map((p, i) => <div key={i} className="row" style={{ gap: 8, padding: "6px 0" }}><Trophy size={15} color="var(--red)" /><span style={{ fontSize: 14 }}>{f.pr(p)}</span></div>)}
        </div>
      )}
      <button className="btn" style={{ marginTop: 34, maxWidth: 420 }} onClick={onDone}>{t.ui.done}</button>
    </div>
  );
}
