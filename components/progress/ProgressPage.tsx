"use client";

import { useState } from "react";
import { Lock, Trophy } from "lucide-react";
import { ACH } from "@/lib/metrics";
import { useApp } from "@/components/shell/context";
import { Seg } from "@/components/ui/primitives";
import { OverviewTab } from "./OverviewTab";
import { BodyTab } from "./BodyTab";
import { PhotosTab } from "./PhotosTab";

function AwardsTab() {
  const { state, metrics, t } = useApp();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10 }}>
      {ACH.map((a) => {
        const on = a.test(state, metrics);
        const [name, desc] = t.ach[a.id];
        return (
          <div key={a.id} className={`badge ${on ? "" : "lock"}`}>
            <div className="bi">{on ? <Trophy size={15} color="var(--red)" /> : <Lock size={14} color="var(--dim)" />}</div>
            <div><div className="d up" style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{name}</div><div className="lbl" style={{ marginTop: 4 }}>{desc}</div></div>
          </div>
        );
      })}
    </div>
  );
}

type PTab = "overview" | "body" | "photos" | "awards";

export function ProgressPage() {
  const { t } = useApp();
  const [tab, setTab] = useState<PTab>("overview");
  return (
    <div className="wrap">
      <div className="lbl">{t.ui.isItWorking}</div>
      <h1 className="h1 d" style={{ marginTop: 6 }}>{t.ui.progress}</h1>
      <div style={{ marginTop: 18, maxWidth: 520 }}>
        <Seg value={tab} onChange={setTab} options={[["overview", t.ui.overview], ["body", t.ui.body], ["photos", t.ui.photos], ["awards", t.ui.awards]]} />
      </div>
      <div style={{ marginTop: 22 }}>
        {tab === "overview" && <OverviewTab />}
        {tab === "body" && <BodyTab />}
        {tab === "photos" && <PhotosTab />}
        {tab === "awards" && <AwardsTab />}
      </div>
    </div>
  );
}
