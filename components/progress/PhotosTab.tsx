"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Camera, Trash2 } from "lucide-react";
import { addDays, clamp, diffDays, parseKey } from "@/lib/utils/date";
import type { Photo, Pose } from "@/lib/types";
import { useApp } from "@/components/shell/context";
import { Field, SecH, Seg } from "@/components/ui/primitives";

const urlCache = new Map<string, string>();

function PhotoImg({ photo, style }: { photo: Photo; style: CSSProperties }) {
  const { repo } = useApp();
  const [src, setSrc] = useState<string | null>(urlCache.get(photo.id) ?? null);
  useEffect(() => {
    if (urlCache.has(photo.id)) return;
    let live = true;
    repo.photoUrl(photo.id, photo.path).then((u) => { if (u) urlCache.set(photo.id, u); if (live) setSrc(u); });
    return () => { live = false; };
  }, [photo.id, photo.path, repo]);
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img src={src} alt="" style={style} /> : <div style={{ ...style, background: "var(--s2)" }} />;
}

function compressImage(file: File, max = 1000, q = 0.82): Promise<Blob> {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((b) => (b ? res(b) : rej(new Error("encode"))), "image/jpeg", q);
    };
    img.onerror = rej;
    img.src = url;
  });
}

const fill: CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" };

export function PhotosTab() {
  const { state, actions, t, f } = useApp();
  const [pose, setPose] = useState<Pose>("front");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const list = state.photos.filter((p) => p.pose === pose).sort((a, b) => a.date.localeCompare(b.date));
  const [aId, setA] = useState<string | null>(null);
  const [bId, setB] = useState<string | null>(null);
  const [pos, setPos] = useState(50);
  const A = list.find((p) => p.id === aId) || list[0];
  const B = list.find((p) => p.id === bId) || list[list.length - 1];
  const dayN = (k: string) => diffDays(state.profile.startDate, k) + 1;
  const poseName = t.pose[pose];
  const endMonth = t.months[parseKey(addDays(state.profile.startDate, 364)).getMonth()];
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    try { await actions.addPhoto(pose, await compressImage(file)); } finally { setBusy(false); }
  };
  return (
    <div>
      <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240, maxWidth: 380 }}>
          <Seg value={pose} onChange={(v) => { setPose(v); setA(null); setB(null); }} options={[["front", t.ui.front], ["side", t.ui.side], ["back", t.ui.back]]} />
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFile} />
        <button className="btn sm" onClick={() => fileRef.current?.click()} disabled={busy}><Camera size={17} />{busy ? t.ui.saving : t.ui.addPhoto(poseName)}</button>
      </div>
      {list.length >= 2 && A && B && (
        <div className="two" style={{ marginTop: 22 }}>
          <div>
            <div className="cmp" onPointerMove={(e) => { if (e.buttons !== 1) return; const r = e.currentTarget.getBoundingClientRect(); setPos(clamp(((e.clientX - r.left) / r.width) * 100, 0, 100)); }}>
              <PhotoImg photo={B} style={fill} />
              <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${100 - pos}% 0 0)` }}><PhotoImg photo={A} style={fill} /></div>
              <div className="ln" style={{ left: `calc(${pos}% - 1px)` }} />
              <span className="chip" style={{ position: "absolute", left: 10, top: 10, background: "rgba(0,0,0,.7)", color: "#fff" }}>{t.ui.dayCaps(dayN(A.date))}</span>
              <span className="chip r" style={{ position: "absolute", right: 10, top: 10, background: "var(--red)", color: "#fff" }}>{t.ui.dayCaps(dayN(B.date))}</span>
            </div>
            <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))} style={{ marginTop: 12, padding: 0, accentColor: "#e8291c", background: "transparent", border: 0 }} aria-label={t.ui.slider} />
          </div>
          <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
            <Field label={t.ui.before}><select value={A.id} onChange={(e) => setA(e.target.value)}>{list.map((p) => <option key={p.id} value={p.id}>{t.ui.photoOpt(dayN(p.date), f.short(p.date))}</option>)}</select></Field>
            <Field label={t.ui.after}><select value={B.id} onChange={(e) => setB(e.target.value)}>{list.map((p) => <option key={p.id} value={p.id}>{t.ui.photoOpt(dayN(p.date), f.short(p.date))}</option>)}</select></Field>
            <p className="lbl">{t.ui.photoHint}</p>
          </div>
        </div>
      )}
      <div className="sec">
        <SecH title={t.ui.timeline(poseName)} />
        {list.length ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 8 }}>
          {[...list].reverse().map((p) => (
            <div key={p.id} style={{ position: "relative" }}>
              <PhotoImg photo={p} style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", borderRadius: 3, display: "block" }} />
              <div className="between" style={{ marginTop: 6 }}><span className="lbl">{t.ui.photoCaption(dayN(p.date), f.short(p.date))}</span>
                <button className="ib" style={{ width: 30, height: 30 }} onClick={() => actions.deletePhoto(p.id)} aria-label={t.ui.deletePhoto}><Trash2 size={14} /></button></div>
            </div>
          ))}
        </div> : <p className="mute">{t.ui.noPhoto(poseName, endMonth)}</p>}
      </div>
    </div>
  );
}
