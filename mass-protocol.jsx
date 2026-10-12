import React, { useState, useEffect, useMemo, useRef, useCallback, createContext, useContext } from "react";
import { ComposedChart, Line, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
  Check, Dumbbell, UtensilsCrossed, CalendarDays, LineChart as LineIcon, User, Crosshair, Play,
  ChevronLeft, ChevronRight, X, Plus, Minus, RefreshCw, Camera, Timer, Zap, Trophy, Trash2,
  SkipForward, ArrowLeftRight, ShoppingBasket, Activity as ActivityIcon, Lock,
} from "lucide-react";

/* =========================================================
   ELIE // MASS PROTOCOL
   Single-file build. Sections:
   1 Design system   2 Utils   3 Program engine   4 Nutrition engine
   5 Store & metrics 6 UI primitives   7 Pages   8 Workout mode   9 Shell
   ========================================================= */

/* ---------- 1. DESIGN SYSTEM ---------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800;900&family=Archivo:wght@400;500;600;700&display=swap');
.mp{--bg:#050505;--s1:#0d0d0d;--s2:#151515;--s3:#1f1f1f;--line:#1e1e1e;--line2:#2c2c2c;--text:#f0ede7;--mute:#8d8a84;--dim:#5a5853;--red:#e8291c;--red2:#ff4a3d;--redd:rgba(232,41,28,.14);
  background:var(--bg);color:var(--text);font-family:'Archivo',system-ui,-apple-system,sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased;font-size:15px;line-height:1.45;-webkit-tap-highlight-color:transparent}
.mp *{box-sizing:border-box}
:where(.mp) button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;padding:0}
:where(.mp) :is(input,textarea,select){font:inherit;color:var(--text);background:var(--s2);border:1px solid var(--line2);border-radius:3px;padding:12px;width:100%;outline:none;font-size:16px}
.mp input:focus,.mp textarea:focus,.mp select:focus{border-color:var(--mute)}
.mp :focus-visible{outline:2px solid var(--red);outline-offset:2px}
.d{font-family:'Big Shoulders Display','HelveticaNeue-CondensedBlack','Arial Narrow',Impact,sans-serif;letter-spacing:.01em}
.n{font-variant-numeric:tabular-nums}
.up{text-transform:uppercase}
.mute{color:var(--mute)} .dim{color:var(--dim)} .red{color:var(--red)}
.shell{display:flex;min-height:100vh}
.side{display:none}
.main{flex:1;min-width:0;overflow-x:clip;padding-bottom:calc(88px + env(safe-area-inset-bottom))}
.wrap{max-width:1120px;margin:0 auto;padding:22px 16px 24px}
.bnav{position:fixed;left:0;right:0;bottom:0;z-index:40;display:grid;grid-template-columns:repeat(6,1fr);background:rgba(5,5,5,.94);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-top:1px solid var(--line);padding-bottom:env(safe-area-inset-bottom)}
.bnav button{display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 0 9px;color:var(--dim);font-size:10px;font-weight:600;letter-spacing:.06em;position:relative}
.bnav button.on{color:var(--text)}
.bnav button.on:before{content:'';position:absolute;top:-1px;left:30%;right:30%;height:2px;background:var(--red)}
@media(min-width:900px){
  .side{display:flex;flex-direction:column;width:232px;flex-shrink:0;border-right:1px solid var(--line);padding:28px 18px;position:sticky;top:0;height:100vh}
  .bnav{display:none}
  .main{padding-bottom:40px}
  .wrap{padding:36px 40px}
}
.side .brand{margin-bottom:36px}
.side nav button{display:flex;align-items:center;gap:12px;width:100%;padding:12px 12px;border-radius:3px;color:var(--mute);font-weight:600;font-size:14px;letter-spacing:.04em}
.side nav button:hover{color:var(--text);background:var(--s1)}
.side nav button.on{color:var(--text);background:var(--s2);box-shadow:inset 2px 0 0 var(--red)}
.brand .b1{font-size:30px;font-weight:900;line-height:.9}
.brand .b2{font-size:13px;font-weight:700;color:var(--red);letter-spacing:.18em;margin-top:4px}
.card{background:var(--s1);border:1px solid var(--line);border-radius:4px;padding:18px}
.card.flat{background:transparent}
.h1{font-size:44px;font-weight:900;line-height:.92;text-transform:uppercase}
.h2{font-size:24px;font-weight:800;text-transform:uppercase;line-height:1}
.h3{font-size:19px;font-weight:800;text-transform:uppercase;line-height:1.05}
.lbl{font-size:12.5px;color:var(--mute);font-weight:500}
.sec{margin-top:30px}
.sec-h{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:12px;gap:12px}
.row{display:flex;align-items:center;gap:12px}
.between{display:flex;align-items:center;justify-content:space-between;gap:12px}
.grid2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px}
.stack{display:grid;gap:14px;grid-template-columns:minmax(0,1fr)}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.grid4{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
@media(min-width:640px){.grid4{grid-template-columns:repeat(4,1fr)}}
.two{display:grid;gap:28px;grid-template-columns:minmax(0,1fr)}
@media(min-width:980px){.two{grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:36px;align-items:start}}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;height:54px;padding:0 22px;border-radius:3px;background:var(--red);color:#fff !important;font-family:'Big Shoulders Display','HelveticaNeue-CondensedBold','Arial Narrow',Impact,sans-serif;font-weight:800;font-size:20px;letter-spacing:.06em;text-transform:uppercase;transition:transform .12s,background .2s;width:100%;white-space:nowrap}
.btn:active{transform:scale(.985)} .btn:hover{background:var(--red2)}
.btn.ghost{background:transparent;border:1px solid var(--line2);color:var(--text) !important}
.btn.ghost:hover{border-color:var(--mute)}
.btn.sm{height:42px;font-size:16px;padding:0 14px;width:auto}
.btn.xs{height:34px;font-size:14px;padding:0 12px;width:auto}
.btn:disabled{opacity:.35;pointer-events:none}
.ib{width:44px;height:44px;display:inline-flex;align-items:center;justify-content:center;border-radius:3px;color:var(--mute);flex-shrink:0}
.ib:hover{color:var(--text);background:var(--s2)}
.chip{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 9px;border-radius:2px;border:1px solid var(--line2);font-size:12px;font-weight:600;color:var(--mute);white-space:nowrap}
.chip.r{border-color:transparent;background:var(--redd);color:var(--red2)}
.seg{display:flex;border:1px solid var(--line2);border-radius:3px;padding:3px;gap:3px}
.seg button{flex:1;height:38px;border-radius:2px;font-weight:700;font-size:13px;letter-spacing:.05em;color:var(--mute)}
.seg button.on{background:var(--s3);color:var(--text)}
.bar{height:5px;background:var(--s3);border-radius:1px;overflow:hidden}
.bar>i{display:block;height:100%;background:var(--red);transition:width .7s cubic-bezier(.2,.8,.2,1)}
.bar.w>i{background:var(--text)}
.chk{width:28px;height:28px;border:1.5px solid #4d4b47;border-radius:3px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .18s,border-color .18s}
.chk.on{background:var(--red);border-color:var(--red);animation:pop .32s cubic-bezier(.3,1.6,.5,1)}
.chk.on svg{animation:draw .3s ease-out}
.chk.auto{border-style:dashed}
@keyframes pop{0%{transform:scale(.7)}100%{transform:scale(1)}}
@keyframes draw{0%{opacity:0;transform:scale(.4) rotate(-20deg)}100%{opacity:1;transform:none}}
.task{display:flex;align-items:center;gap:14px;min-height:60px;padding:10px 4px;border-bottom:1px solid var(--line)}
.task:last-child{border-bottom:0}
.task .tl{flex:1;min-width:0}
.task .tt{font-weight:600;font-size:15.5px}
.task.done .tt{color:var(--mute);text-decoration:line-through;text-decoration-color:var(--dim)}
.task .ts{font-size:12.5px;color:var(--mute);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.task .go{color:var(--dim);display:flex}
.secname{font-size:13px;font-weight:800;color:var(--dim);letter-spacing:.12em;padding:18px 4px 2px;text-transform:uppercase;font-family:'Big Shoulders Display','HelveticaNeue-CondensedBlack','Arial Narrow',Impact,sans-serif}
.ov{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.72);display:flex;align-items:flex-end;justify-content:center;animation:fade .2s}
.sheet{background:var(--s1);border-top:1px solid var(--line2);width:100%;max-width:620px;max-height:92vh;overflow:auto;border-radius:6px 6px 0 0;animation:up .28s cubic-bezier(.2,.8,.2,1);padding-bottom:env(safe-area-inset-bottom)}
@media(min-width:760px){.ov{align-items:center}.sheet{border:1px solid var(--line2);border-radius:5px;max-height:86vh}}
.sheet-h{position:sticky;top:0;background:var(--s1);display:flex;align-items:center;justify-content:space-between;padding:14px 12px 10px 20px;border-bottom:1px solid var(--line);z-index:2}
.sheet-b{padding:20px}
@keyframes up{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}
@keyframes fade{from{opacity:0}to{opacity:1}}
.toast{position:fixed;top:calc(14px + env(safe-area-inset-top));left:50%;transform:translateX(-50%);z-index:90;background:var(--text);color:#000;padding:11px 16px;border-radius:3px;font-weight:700;font-size:14px;display:flex;align-items:center;gap:10px;animation:up .25s;box-shadow:0 10px 40px rgba(0,0,0,.6);max-width:92vw}
.toast.red{background:var(--red);color:#fff}
.stat .v{font-size:44px;font-weight:900;line-height:.9}
.stat .k{font-size:12px;color:var(--mute);margin-top:6px;font-weight:500}
.stat.lg .v{font-size:64px}
.rail{display:grid;grid-template-columns:repeat(52,1fr);gap:2px;height:14px}
.rail i{background:var(--s3)}
.rail i.f{background:var(--red)}
.rail i.c{background:var(--text)}
.hm{display:grid;grid-auto-flow:column;grid-template-rows:repeat(7,auto);grid-auto-columns:minmax(0,1fr);gap:3px}
.hm i{aspect-ratio:1;border-radius:1px;background:var(--s2);display:block}
.hm i.fut{background:transparent;box-shadow:inset 0 0 0 1px var(--line)}
.hm i.today{box-shadow:inset 0 0 0 1.5px var(--text)}
.l1{background:rgba(232,41,28,.2) !important}.l2{background:rgba(232,41,28,.4) !important}.l3{background:rgba(232,41,28,.62) !important}.l4{background:rgba(232,41,28,.82) !important}.l5{background:#ff3b2e !important}
.meal{display:flex;gap:14px;padding:14px;border:1px solid var(--line);border-radius:4px;background:var(--s1)}
.tile{width:68px;height:68px;flex-shrink:0;border-radius:3px;background:repeating-linear-gradient(135deg,#141414 0 6px,#101010 6px 12px);border:1px solid var(--line2);display:flex;flex-direction:column;align-items:center;justify-content:center}
.tile b{font-family:'Big Shoulders Display','HelveticaNeue-CondensedBlack','Arial Narrow',Impact,sans-serif;font-size:26px;font-weight:900;line-height:.9}
.tile span{font-size:10px;color:var(--mute);font-weight:700;letter-spacing:.08em}
.wm{position:fixed;inset:0;z-index:70;background:var(--bg);overflow:auto;display:flex;flex-direction:column}
.wm-in{max-width:640px;width:100%;margin:0 auto;padding:0 16px calc(24px + env(safe-area-inset-bottom));flex:1;display:flex;flex-direction:column}
.stepper{display:flex;align-items:center;border:1px solid var(--line2);border-radius:3px;height:56px;background:var(--s2)}
.stepper button{width:48px;height:100%;display:flex;align-items:center;justify-content:center;color:var(--mute)}
.stepper button:active{color:var(--text)}
.stepper input{border:0;background:transparent;text-align:center;font-family:'Big Shoulders Display','HelveticaNeue-CondensedBlack','Arial Narrow',Impact,sans-serif;font-size:28px;font-weight:800;padding:0;height:100%;min-width:0}
.setrow{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--line)}
.rest{background:var(--red);color:#fff;border-radius:3px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px}
.cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px}
.cal .c{aspect-ratio:1/1.05;border-radius:2px;background:var(--s1);border:1px solid var(--line);padding:5px;display:flex;flex-direction:column;justify-content:space-between;text-align:left;position:relative;overflow:hidden}
.cal .c .dn{font-size:12px;font-weight:700}
.cal .c .tg{font-size:9.5px;font-weight:800;letter-spacing:.02em;color:var(--mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cal .c.today{border-color:var(--text)}
.cal .c.out{opacity:.25}
.cal .c .fill{position:absolute;left:0;right:0;bottom:0;background:var(--red);opacity:.85;pointer-events:none}
.cal .c>*{position:relative;z-index:1}
.badge{border:1px solid var(--line2);border-radius:4px;padding:16px;background:linear-gradient(160deg,#171717,#0c0c0c);text-align:left;min-height:118px;display:flex;flex-direction:column;justify-content:space-between}
.badge.lock{opacity:.32;background:transparent}
.badge .bi{width:34px;height:34px;border:1px solid var(--red);transform:rotate(45deg);display:flex;align-items:center;justify-content:center;margin:4px 0 12px 4px}
.badge .bi>*{transform:rotate(-45deg)}
.badge.lock .bi{border-color:var(--dim)}
.splash{position:fixed;inset:0;z-index:100;background:var(--bg);display:flex;flex-direction:column;justify-content:center;padding:32px;cursor:pointer}
.splash .s1{font-size:min(30vw,190px);font-weight:900;line-height:.82}
.splash .s2{font-size:min(9vw,54px);font-weight:800;color:var(--red);letter-spacing:.1em;margin-top:8px}
.complete{position:fixed;inset:0;z-index:95;background:rgba(5,5,5,.97);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;animation:fade .3s}
.complete .big{font-size:min(38vw,240px);font-weight:900;line-height:.85;color:var(--red);animation:slam .6s cubic-bezier(.2,1.4,.4,1)}
@keyframes slam{0%{transform:scale(1.6);opacity:0}100%{transform:none;opacity:1}}
.cmp{position:relative;width:100%;aspect-ratio:3/4;overflow:hidden;border-radius:4px;background:var(--s2);user-select:none}
.cmp img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.cmp .ln{position:absolute;top:0;bottom:0;width:2px;background:var(--red)}
.tbl{width:100%;border-collapse:collapse;font-size:14px}
.tbl td,.tbl th{padding:10px 6px;border-bottom:1px solid var(--line);text-align:left}
.tbl th{font-weight:600;color:var(--mute);font-size:12px}
.field{display:flex;flex-direction:column;gap:6px}
.field>span{font-size:12.5px;color:var(--mute);font-weight:500}
.opt{display:flex;gap:8px;flex-wrap:wrap}
.opt button{height:44px;padding:0 16px;border:1px solid var(--line2);border-radius:3px;font-weight:600;font-size:14px;color:var(--mute)}
.opt button.on{border-color:var(--red);color:var(--text);background:var(--redd)}
.scroll-x{overflow-x:auto}
@media(prefers-reduced-motion:reduce){.mp *{animation:none !important;transition:none !important}}
`;

/* ---------- 2. UTILS ---------- */
const pad = (n, l = 2) => String(n).padStart(l, "0");
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (k, n) => { const d = parseKey(k); d.setDate(d.getDate() + n); return keyOf(d); };
const diffDays = (a, b) => Math.round((parseKey(b) - parseKey(a)) / 864e5);
const todayKey = () => keyOf(new Date());
const isoDow = (k) => (parseKey(k).getDay() + 6) % 7; // 0 = Monday
const weekStartOf = (k) => addDays(k, -isoDow(k));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const DOW = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DOW3 = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const fmtDate = (k) => { const d = parseKey(k); return `${DOW[isoDow(k)]} ${d.getDate()} ${MONTHS[d.getMonth()]}`; };
const fmtShort = (k) => { const d = parseKey(k); return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`; };
const fmtNum = (n) => Math.round(n).toLocaleString("en-US");
const fmtKg = (n, sign = false) => (n == null ? "–" : `${sign && n > 0 ? "+" : ""}${n.toFixed(1)}`);
const fmtDur = (ms) => { const m = Math.floor(ms / 60000); return m >= 60 ? `${Math.floor(m / 60)}h${pad(m % 60)}` : `${m} min`; };
const fmtClock = (s) => `${Math.floor(s / 60)}:${pad(Math.max(0, s % 60))}`;
const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);

/* ---------- 3. PROGRAM ENGINE ---------- */
const PHASES = [
  { id: 1, name: "Foundation", weeks: [1, 8], goal: "Show up four times a week, own the technique, add a little load every session.", note: "Leave 2 reps in reserve. Clean reps beat heavy reps." },
  { id: 2, name: "Mass", weeks: [9, 20], goal: "Five sessions a week. Full volume, calorie surplus every day.", note: "Last set of each exercise: 1 rep short of failure." },
  { id: 3, name: "Growth", weeks: [21, 32], goal: "More sets on isolation work. Push the weights you set in Mass.", note: "Isolation work gets an extra set. Chase the logbook." },
  { id: 4, name: "Specialization", weeks: [33, 44], goal: "Shoulders, arms and upper chest get priority volume for the aesthetic V.", note: "Shoulders and arms get an extra set this phase." },
  { id: 5, name: "Peak physique", weeks: [45, 52], goal: "Maximum intensity on the lifts you built all year. Finish strong.", note: "Every set counts. Hit your rep targets, then add weight." },
];

// iso: isolation; inc: weight jump (kg) when the rep range is beaten
const EX = {
  inc_db_press: { name: "Incline Dumbbell Press", m: "Upper chest", inc: 2, alt: ["inc_bb_press", "inc_machine"] },
  inc_bb_press: { name: "Incline Barbell Press", m: "Upper chest", inc: 2.5, alt: ["inc_db_press", "inc_machine"] },
  inc_machine: { name: "Incline Machine Press", m: "Upper chest", inc: 2.5, alt: ["inc_db_press", "inc_bb_press"] },
  bench: { name: "Barbell Bench Press", m: "Chest", inc: 2.5, alt: ["db_bench", "machine_press"] },
  db_bench: { name: "Flat Dumbbell Press", m: "Chest", inc: 2, alt: ["bench", "machine_press"] },
  machine_press: { name: "Machine Chest Press", m: "Chest", inc: 2.5, alt: ["bench", "db_bench"] },
  db_ohp: { name: "Seated Dumbbell Shoulder Press", m: "Front delts", inc: 2, alt: ["machine_ohp"] },
  machine_ohp: { name: "Machine Shoulder Press", m: "Front delts", inc: 2.5, alt: ["db_ohp"] },
  cable_lat: { name: "Cable Lateral Raise", m: "Side delts", inc: 1.25, iso: true, alt: ["db_lat"] },
  db_lat: { name: "Dumbbell Lateral Raise", m: "Side delts", inc: 1, iso: true, alt: ["cable_lat"] },
  cable_fly: { name: "Cable Fly", m: "Chest", inc: 2.5, iso: true, alt: ["pec_deck"] },
  pec_deck: { name: "Pec Deck", m: "Chest", inc: 2.5, iso: true, alt: ["cable_fly"] },
  oh_tri: { name: "Overhead Cable Triceps Extension", m: "Triceps", inc: 2.5, iso: true, alt: ["skull", "pushdown"] },
  pushdown: { name: "Triceps Pushdown", m: "Triceps", inc: 2.5, iso: true, alt: ["oh_tri"] },
  skull: { name: "EZ-Bar Skull Crusher", m: "Triceps", inc: 2.5, iso: true, alt: ["oh_tri"] },
  dips: { name: "Dips", m: "Chest, triceps", inc: 2.5, alt: ["pushdown", "machine_press"], bw: true },
  lat_pd: { name: "Lat Pulldown", m: "Lats", inc: 2.5, alt: ["pullup"] },
  pullup: { name: "Pull-up", m: "Lats", inc: 2.5, alt: ["lat_pd"], bw: true },
  cs_row: { name: "Chest-Supported Row", m: "Upper back", inc: 2.5, alt: ["cable_row", "db_row"] },
  cable_row: { name: "Seated Cable Row", m: "Mid back", inc: 2.5, alt: ["cs_row", "db_row"] },
  db_row: { name: "One-Arm Dumbbell Row", m: "Lats", inc: 2, alt: ["cs_row", "cable_row"] },
  straight_pd: { name: "Straight-Arm Pulldown", m: "Lats", inc: 2.5, iso: true, alt: ["lat_pd"] },
  face_pull: { name: "Face Pull", m: "Rear delts", inc: 2.5, iso: true, alt: ["rear_fly"] },
  rear_fly: { name: "Reverse Pec Deck", m: "Rear delts", inc: 2.5, iso: true, alt: ["face_pull"] },
  inc_curl: { name: "Incline Dumbbell Curl", m: "Biceps", inc: 1, iso: true, alt: ["ez_curl", "cable_curl"] },
  ez_curl: { name: "EZ-Bar Curl", m: "Biceps", inc: 2.5, iso: true, alt: ["inc_curl", "cable_curl"] },
  cable_curl: { name: "Cable Curl", m: "Biceps", inc: 2.5, iso: true, alt: ["hammer", "ez_curl"] },
  hammer: { name: "Hammer Curl", m: "Brachialis, forearms", inc: 1, iso: true, alt: ["cable_curl"] },
  squat: { name: "Back Squat", m: "Quads, glutes", inc: 2.5, alt: ["hack", "smith_squat"] },
  smith_squat: { name: "Smith Machine Squat", m: "Quads, glutes", inc: 2.5, alt: ["squat", "hack"] },
  hack: { name: "Hack Squat", m: "Quads", inc: 5, alt: ["leg_press", "smith_squat"] },
  leg_press: { name: "Leg Press", m: "Quads, glutes", inc: 5, alt: ["hack"] },
  rdl: { name: "Romanian Deadlift", m: "Hamstrings, glutes", inc: 2.5, alt: ["lying_curl"] },
  lying_curl: { name: "Lying Leg Curl", m: "Hamstrings", inc: 2.5, iso: true, alt: ["seated_curl"] },
  seated_curl: { name: "Seated Leg Curl", m: "Hamstrings", inc: 2.5, iso: true, alt: ["lying_curl"] },
  leg_ext: { name: "Leg Extension", m: "Quads", inc: 2.5, iso: true, alt: ["leg_press"] },
  lunge: { name: "Walking Lunge (reps per leg)", m: "Quads, glutes", inc: 2, alt: ["leg_press"] },
  calf_stand: { name: "Standing Calf Raise", m: "Calves", inc: 2.5, iso: true, alt: ["calf_seat"] },
  calf_seat: { name: "Seated Calf Raise", m: "Calves", inc: 2.5, iso: true, alt: ["calf_stand"] },
  cable_crunch: { name: "Cable Crunch", m: "Abs", inc: 2.5, iso: true, alt: ["hlr"] },
  hlr: { name: "Hanging Leg Raise", m: "Abs", inc: 2.5, iso: true, alt: ["cable_crunch"], bw: true },
};
const FOCUS_P4 = new Set(["cable_lat", "db_lat", "inc_db_press", "inc_bb_press", "inc_curl", "ez_curl", "cable_curl", "oh_tri", "skull", "rear_fly", "face_pull"]);

const e = (id, sets, lo, hi, rest) => ({ id, sets, reps: [lo, hi], rest });
const TEMPLATES = {
  push: { name: "Push", focus: "Chest, shoulders, triceps", short: "PUSH", ex: [e("inc_db_press", 4, 8, 10, 120), e("bench", 3, 6, 8, 150), e("db_ohp", 3, 8, 10, 120), e("cable_lat", 4, 12, 15, 60), e("cable_fly", 3, 12, 15, 75), e("oh_tri", 3, 10, 12, 75), e("pushdown", 2, 12, 15, 60)] },
  pull: { name: "Pull", focus: "Back, rear delts, biceps", short: "PULL", ex: [e("lat_pd", 4, 8, 10, 120), e("cs_row", 4, 8, 10, 120), e("cable_row", 3, 10, 12, 90), e("straight_pd", 2, 12, 15, 60), e("face_pull", 3, 15, 20, 60), e("inc_curl", 3, 10, 12, 75), e("hammer", 2, 10, 12, 60)] },
  legs: { name: "Legs", focus: "Quads, hamstrings, calves, abs", short: "LEGS", ex: [e("squat", 4, 6, 8, 180), e("rdl", 3, 8, 10, 150), e("leg_press", 3, 10, 12, 120), e("lying_curl", 3, 10, 12, 75), e("leg_ext", 2, 12, 15, 60), e("calf_stand", 4, 10, 15, 60), e("cable_crunch", 3, 12, 15, 60)] },
  upper: { name: "Upper", focus: "Back width, upper chest, delts, arms", short: "UPPER", ex: [e("pullup", 3, 6, 10, 120), e("inc_bb_press", 3, 6, 8, 150), e("db_row", 3, 8, 10, 90), e("db_lat", 4, 12, 15, 60), e("rear_fly", 2, 15, 20, 60), e("ez_curl", 3, 8, 12, 75), e("skull", 3, 8, 12, 75)] },
  lower: { name: "Lower & Arms", focus: "Quads, hamstrings, calves, arms", short: "LOWER", ex: [e("hack", 3, 8, 10, 150), e("seated_curl", 3, 10, 12, 75), e("lunge", 2, 10, 12, 90), e("calf_seat", 3, 12, 15, 60), e("dips", 3, 8, 12, 90), e("cable_curl", 3, 10, 12, 60), e("hlr", 3, 10, 15, 60)] },
};
// isoDow -> template. Padel (Mon-Wed mornings by default) stays compatible: upper body first, legs later in the week.
const SCHEDULES = {
  4: { 0: "push", 1: "pull", 3: "legs", 5: "upper" },
  5: { 0: "push", 1: "pull", 3: "legs", 4: "upper", 5: "lower" },
};

function dayInfo(profile, key) {
  const idx = diffDays(profile.startDate, key);
  const week = clamp(Math.floor(idx / 7) + 1, 1, 52);
  const phase = PHASES.find((p) => week >= p.weeks[0] && week <= p.weeks[1]);
  const spw = profile.sessionsPerWeek === "auto" ? (phase.id === 1 ? 4 : 5) : Number(profile.sessionsPerWeek);
  return {
    key, idx, dayNum: idx + 1, week, phase, spw,
    weekInPhase: week - phase.weeks[0] + 1,
    phaseWeeks: phase.weeks[1] - phase.weeks[0] + 1,
    deload: phase.id < 5 && week === phase.weeks[1],
    tplId: SCHEDULES[spw][isoDow(key)] || null,
    padelPlanned: (profile.padelDays || []).includes(isoDow(key)),
    inProgram: idx >= 0 && idx < 365,
  };
}

function buildWorkout(info, tplId = info.tplId) {
  if (!tplId) return null;
  const t = TEMPLATES[tplId];
  const exercises = t.ex.map((x) => {
    const meta = EX[x.id];
    let sets = x.sets;
    if (info.phase.id === 1 && info.week <= 3) sets -= 1;
    if (info.phase.id === 3 && meta.iso) sets += 1;
    if (info.phase.id === 4 && FOCUS_P4.has(x.id)) sets += 1;
    if (info.deload) sets -= 1;
    return { exId: x.id, name: meta.name, m: meta.m, sets: clamp(sets, 2, 5), reps: x.reps, rest: x.rest };
  });
  const secs = exercises.reduce((s, x) => s + x.sets * (40 + x.rest), 0);
  return {
    tplId, name: t.name, short: t.short, focus: t.focus, exercises,
    duration: Math.round((secs / 60 + 8) / 5) * 5,
    note: info.deload ? "Deload week. Same weights, stop 3 reps short of failure, recover." : info.phase.note,
  };
}

const e1rm = (w, r) => (w > 0 ? w * (1 + r / 30) : 0);

function lastPerformance(sessions, exId) {
  for (let i = sessions.length - 1; i >= 0; i--) {
    const ex = sessions[i].exercises.find((x) => x.exId === exId);
    if (ex && ex.sets.length) return { date: sessions[i].date, sets: ex.sets };
  }
  return null;
}
function bestSetOf(sessions, exId) {
  let best = null;
  sessions.forEach((s) => s.exercises.forEach((x) => {
    if (x.exId !== exId) return;
    x.sets.forEach((st) => { if (!best || e1rm(st.w, st.r) > e1rm(best.w, best.r) || (st.w === best.w && st.r > best.r)) best = { ...st, date: s.date }; });
  }));
  return best;
}
// Progressive overload: beat the top of the range on every set -> add weight; otherwise add a rep.
function targetFor(sessions, exId, reps) {
  const last = lastPerformance(sessions, exId);
  if (!last) return { w: null, r: reps[1], text: `First time. Pick a weight you can lift ${reps[0]}-${reps[1]} times with 2 reps left.` };
  const inc = EX[exId]?.inc || 2.5;
  const topW = Math.max(...last.sets.map((s) => s.w));
  const top = last.sets.filter((s) => s.w === topW);
  if (top.every((s) => s.r >= reps[1])) {
    const w = +(topW + inc).toFixed(2);
    return { w, r: reps[0], text: `Try ${w} kg × ${reps[0]}+` };
  }
  const best = Math.max(...top.map((s) => s.r));
  const r = Math.min(best + 1, reps[1]);
  return { w: topW, r, text: `Try ${topW} kg × ${r}` };
}

/* ---------- 4. NUTRITION ENGINE ---------- */
// [name, unit, kcal, protein, carbs, fat] per 100 g/ml, or per piece/slice/tbsp
const FOODS = {
  oats: ["Oats", "g", 370, 13, 60, 7], milk: ["Semi-skimmed milk", "ml", 46, 3.3, 4.8, 1.6], wmilk: ["Whole milk", "ml", 64, 3.2, 4.8, 3.6],
  egg: ["Eggs", "pc", 78, 6.5, 0.5, 5.5], banana: ["Banana", "pc", 105, 1.3, 27, 0.4], pb: ["Peanut butter", "g", 600, 25, 15, 50],
  skyr: ["Skyr", "g", 63, 11, 4, 0.2], fblanc: ["Fromage blanc 3%", "g", 75, 7.5, 4, 3.2], honey: ["Honey", "g", 320, 0.3, 80, 0],
  granola: ["Granola", "g", 450, 9, 62, 17], bread: ["Wholemeal bread", "slice", 100, 4, 17, 1.3], baguette: ["Baguette", "g", 270, 9, 55, 1.5],
  butter: ["Butter", "g", 740, 0.7, 0.6, 82], jam: ["Jam", "g", 250, 0.5, 60, 0], ham: ["Ham", "g", 115, 20, 1, 3.5],
  turkey: ["Turkey slices", "g", 105, 22, 1, 1.5], emmental: ["Emmental", "g", 380, 28, 0, 30], cheese: ["Grated cheese", "g", 350, 25, 0, 27],
  parmesan: ["Parmesan", "g", 400, 33, 0, 28], chicken: ["Chicken breast", "g", 110, 23, 0, 1.5], rice: ["Rice (dry weight)", "g", 355, 7, 78, 0.8],
  pasta: ["Pasta (dry weight)", "g", 355, 12.5, 71, 1.5], gnocchi: ["Gnocchi", "g", 150, 4, 32, 0.5], potato: ["Potatoes", "g", 80, 2, 17, 0.1],
  sweetpot: ["Sweet potato", "g", 86, 1.6, 20, 0.1], beef5: ["Ground beef 5%", "g", 125, 21, 0, 5], beef15: ["Ground beef 15%", "g", 215, 18, 0, 15],
  lardons: ["Lardons", "g", 270, 15, 0, 23], salmon: ["Salmon fillet", "g", 200, 20, 0, 13], tuna: ["Canned tuna, drained", "g", 115, 26, 0, 1],
  veg: ["Frozen vegetables", "g", 50, 2.5, 7, 0.5], tomsauce: ["Tomato sauce", "g", 40, 1.5, 7, 0.3], tomato: ["Cherry tomatoes", "g", 18, 0.9, 3.9, 0.2],
  oil: ["Olive oil", "g", 900, 0, 0, 100], avocado: ["Avocado", "pc", 240, 3, 13, 22], edamame: ["Edamame", "g", 120, 11, 9, 5],
  mango: ["Mango", "g", 60, 0.8, 15, 0.4], soy: ["Soy sauce", "tbsp", 10, 1, 1, 0], chickpeas: ["Chickpeas, canned", "g", 140, 7, 18, 3],
  tortilla: ["Tortilla wrap", "pc", 180, 5, 30, 4.5], hummus: ["Hummus", "g", 300, 7, 12, 25], almonds: ["Almonds", "g", 600, 21, 10, 52],
  nuts: ["Mixed nuts", "g", 620, 18, 15, 53], dates: ["Dates", "g", 280, 2.5, 70, 0.4], chili: ["Chili con carne, ready meal", "g", 120, 8, 12, 4],
  pesto: ["Pesto", "g", 450, 5, 5, 45], curry: ["Curry powder", "tbsp", 6, 0.3, 1, 0.3],
};
const INT_FOODS = new Set(["egg", "tortilla"]);

const M = (id, slot, name, prep, ing, steps, o = {}) => ({ id, slot, name, prep, ing, steps, noCook: !!o.noCook, tags: o.tags || [], tip: o.tip });
const MEALS = [
  M("b1", "breakfast", "Mass breakfast", 10, [["egg", 3], ["oats", 100], ["wmilk", 250], ["banana", 1], ["pb", 20]],
    ["Microwave the oats with the milk for 2 to 3 minutes, stir halfway.", "Scramble the eggs in a hot non-stick pan, about 3 minutes.", "Slice the banana over the oats and add the peanut butter."]),
  M("b2", "breakfast", "Skyr crunch bowl", 3, [["skyr", 300], ["granola", 80], ["banana", 1], ["honey", 15], ["almonds", 20]],
    ["Spoon the skyr into a bowl.", "Top with granola, sliced banana and almonds.", "Finish with honey."], { noCook: true }),
  M("b3", "breakfast", "Egg toast stack", 8, [["egg", 4], ["bread", 3], ["butter", 10], ["emmental", 30]],
    ["Toast the bread and butter it.", "Fry or scramble the eggs, 3 to 4 minutes.", "Stack eggs and emmental on the toast."]),
  M("b4", "breakfast", "Overnight oats", 5, [["fblanc", 250], ["oats", 80], ["milk", 150], ["pb", 20], ["banana", 1]],
    ["The night before: mix oats, fromage blanc and milk in a jar.", "Refrigerate overnight.", "Morning: add sliced banana and peanut butter. Eat cold."], { noCook: true, tip: "Prep it before bed, zero effort in the morning." }),
  M("b5", "breakfast", "Bakery breakfast", 3, [["baguette", 120], ["butter", 15], ["jam", 30], ["skyr", 200], ["milk", 250]],
    ["Grab a baguette on the way.", "Butter and jam on the bread.", "Skyr on the side, glass of milk."], { noCook: true }),

  M("s1", "snack", "Skyr, banana, almonds", 1, [["skyr", 200], ["banana", 1], ["almonds", 25]], ["Skyr in a bowl, banana and almonds on the side."], { noCook: true }),
  M("s2", "snack", "Ham & cheese baguette", 3, [["baguette", 100], ["ham", 60], ["emmental", 25], ["butter", 10]], ["Butter the baguette.", "Fill with ham and emmental."], { noCook: true, tags: ["pork"] }),
  M("s3", "snack", "Fromage blanc granola", 2, [["fblanc", 200], ["granola", 50], ["honey", 10]], ["Fromage blanc in a bowl.", "Top with granola and honey."], { noCook: true }),
  M("s4", "snack", "Turkey hummus wrap", 3, [["tortilla", 1], ["turkey", 80], ["cheese", 20], ["hummus", 30]], ["Spread hummus on the wrap.", "Add turkey and cheese, roll tight."], { noCook: true }),
  M("s5", "snack", "PB toast & milk", 4, [["bread", 2], ["pb", 30], ["banana", 1], ["milk", 300]], ["Toast the bread.", "Peanut butter and sliced banana on top.", "Big glass of milk."], { noCook: true }),
  M("s6", "snack", "Tuna baguette", 3, [["baguette", 100], ["tuna", 100], ["butter", 10]], ["Butter the baguette.", "Fill with drained tuna, pepper."], { noCook: true, tags: ["fish"] }),
  M("s7", "snack", "Nuts, dates & skyr", 1, [["nuts", 30], ["dates", 30], ["skyr", 150]], ["Skyr in a bowl, nuts and dates on the side."], { noCook: true }),

  M("l1", "lunch", "Chicken mass bowl", 15, [["chicken", 200], ["rice", 120], ["avocado", 0.5], ["veg", 150], ["oil", 10], ["soy", 1]],
    ["Cook the rice, or use 2 microwave pouches.", "Dice the chicken, pan-fry in the olive oil 6 to 8 minutes.", "Microwave the vegetables 4 minutes.", "Bowl it up with sliced avocado and soy sauce."]),
  M("l2", "lunch", "Mass poké bowl", 15, [["salmon", 150], ["rice", 120], ["edamame", 80], ["mango", 80], ["avocado", 0.5], ["soy", 1]],
    ["Cook the rice and let it cool slightly.", "Dice the salmon, mango and avocado.", "Assemble on the rice with edamame and soy sauce."], { tags: ["fish"], tip: "Ordering out? Ask for double protein and extra rice." }),
  M("l3", "lunch", "Beef bolognese", 15, [["pasta", 130], ["beef5", 180], ["tomsauce", 200], ["parmesan", 20], ["oil", 10]],
    ["Boil the pasta.", "Brown the beef in the oil, 5 minutes.", "Add tomato sauce, simmer 5 minutes.", "Serve with parmesan."]),
  M("l4", "lunch", "Tuna rice salad", 12, [["tuna", 140], ["rice", 110], ["chickpeas", 100], ["tomato", 150], ["oil", 15]],
    ["Cook the rice, rinse under cold water.", "Mix with drained tuna, chickpeas and halved tomatoes.", "Olive oil, salt, pepper."], { tags: ["fish"], tip: "Make double, keep half for tomorrow." }),
  M("l5", "lunch", "Chili quick plate", 5, [["chili", 400], ["baguette", 80], ["cheese", 30]],
    ["Microwave the chili, 3 to 4 minutes.", "Top with cheese, serve with bread."], { noCook: true }),
  M("l6", "lunch", "Chicken pesto gnocchi", 12, [["gnocchi", 300], ["chicken", 180], ["pesto", 30], ["parmesan", 15]],
    ["Pan-fry the diced chicken, 6 minutes.", "Add the gnocchi straight to the pan, 4 minutes until golden.", "Stir in pesto, finish with parmesan."]),

  M("d1", "dinner", "Salmon & potatoes", 25, [["salmon", 180], ["potato", 350], ["veg", 150], ["butter", 10]],
    ["Cube the potatoes, microwave 8 minutes, then pan-fry in butter until golden.", "Cook the salmon skin side down 4 minutes, flip, 2 minutes.", "Microwave the vegetables, serve together."], { tags: ["fish"] }),
  M("d2", "dinner", "Burger pasta", 15, [["beef15", 200], ["pasta", 120], ["cheese", 30], ["tomsauce", 100]],
    ["Boil the pasta.", "Brown the beef, add tomato sauce.", "Mix with pasta, melt the cheese on top."]),
  M("d3", "dinner", "Chicken curry rice", 20, [["chicken", 200], ["rice", 110], ["tomsauce", 150], ["veg", 100], ["oil", 10], ["curry", 1]],
    ["Cook the rice.", "Brown the diced chicken in oil with the curry powder.", "Add tomato sauce and vegetables, simmer 8 minutes.", "Serve over the rice."]),
  M("d4", "dinner", "Fast carbonara", 15, [["pasta", 140], ["lardons", 100], ["egg", 2], ["parmesan", 20]],
    ["Boil the pasta, keep a splash of the water.", "Crisp the lardons in a dry pan.", "Off the heat, mix pasta, lardons, beaten eggs and parmesan with a little pasta water."], { tags: ["pork"] }),
  M("d5", "dinner", "Sweet potato beef bowl", 20, [["beef5", 200], ["sweetpot", 350], ["avocado", 0.5], ["cheese", 20]],
    ["Cube the sweet potato, microwave 7 minutes then pan-fry 3 minutes.", "Brown the beef with salt, pepper, paprika.", "Bowl with avocado and cheese."]),
  M("d6", "dinner", "Mass poké (order)", 0, [["chicken", 180], ["rice", 110], ["edamame", 80], ["avocado", 0.5], ["mango", 60]],
    ["Order a large bowl.", "Chicken, double portion.", "Extra rice, avocado and edamame.", "Eat all of the rice."], { noCook: true, tip: "Your usual poké, upgraded for mass." }),

  M("p1", "prebed", "Fromage blanc & honey", 1, [["fblanc", 250], ["honey", 10], ["almonds", 20]], ["Fromage blanc, honey, almonds on top."], { noCook: true }),
  M("p2", "prebed", "Skyr & peanut butter", 1, [["skyr", 200], ["pb", 20]], ["Stir the peanut butter into the skyr."], { noCook: true }),
  M("p3", "prebed", "Milk & PB toast", 3, [["milk", 300], ["bread", 1], ["pb", 15]], ["Toast with peanut butter, glass of milk."], { noCook: true }),
];
const FUEL = M("f1", "fuel", "Activity fuel", 2, [["banana", 1], ["dates", 30], ["baguette", 60], ["pb", 15]],
  ["Before or after the session.", "Banana and dates for fast carbs.", "Bread with peanut butter."], { noCook: true });

const macrosOf = (fid, q) => { const f = FOODS[fid]; const k = f[1] === "g" || f[1] === "ml" ? q / 100 : q; return { kcal: f[2] * k, p: f[3] * k, c: f[4] * k, f: f[5] * k }; };
const sumMacros = (ing) => ing.reduce((a, [fid, q]) => { const m = macrosOf(fid, q); return { kcal: a.kcal + m.kcal, p: a.p + m.p, c: a.c + m.c, f: a.f + m.f }; }, { kcal: 0, p: 0, c: 0, f: 0 });
const ZERO = { kcal: 0, p: 0, c: 0, f: 0 };
const addM = (a, b) => ({ kcal: a.kcal + b.kcal, p: a.p + b.p, c: a.c + b.c, f: a.f + b.f });
[...MEALS, FUEL].forEach((m) => { m.raw = sumMacros(m.ing); });
const MEAL_BY_ID = Object.fromEntries([...MEALS, FUEL].map((m) => [m.id, m]));

function roundQty(fid, q) {
  const u = FOODS[fid][1];
  if (u === "g" || u === "ml") return q < 40 ? Math.max(5, Math.round(q / 5) * 5) : Math.round(q / 10) * 10;
  if (INT_FOODS.has(fid) || u === "slice" || u === "tbsp") return Math.max(1, Math.round(q));
  return Math.max(0.5, Math.round(q * 2) / 2);
}
function scaleMeal(meal, f) {
  const ing = meal.ing.map(([fid, q]) => [fid, roundQty(fid, q * f)]);
  const m = sumMacros(ing);
  return { ...meal, ing, ...m };
}
const fmtQty = (fid, q) => {
  const u = FOODS[fid][1];
  const frac = (x) => (x % 1 === 0.5 ? `${Math.floor(x) || ""}½` : `${x}`);
  if (u === "g") return `${q} g`;
  if (u === "ml") return `${q} ml`;
  if (u === "slice") return `${q} slice${q > 1 ? "s" : ""}`;
  if (u === "tbsp") return `${q} tbsp`;
  return frac(q);
};

const SLOTS = ["breakfast", "snack1", "lunch", "snack2", "dinner", "prebed"];
const libFor = (slot) => (slot === "snack1" || slot === "snack2" ? "snack" : slot);

function filteredLib(prefs = {}) {
  const lib = {};
  ["breakfast", "snack", "lunch", "dinner", "prebed"].forEach((s) => {
    const all = MEALS.filter((m) => m.slot === s);
    let l = all.filter((m) => !(prefs.noFish && m.tags.includes("fish")) && !(prefs.noPork && m.tags.includes("pork")));
    if (prefs.noCook) { const nc = l.filter((m) => m.noCook); if (nc.length) l = nc; }
    lib[s] = l.length ? l : all;
  });
  return lib;
}
const pickAt = (arr, i) => arr[((i % arr.length) + arr.length) % arr.length];

function planMealIds(profile, key) {
  const i = Math.max(0, diffDays(profile.startDate, key));
  const lib = filteredLib(profile.prefs);
  return {
    breakfast: pickAt(lib.breakfast, i).id, snack1: pickAt(lib.snack, i).id, lunch: pickAt(lib.lunch, i).id,
    snack2: pickAt(lib.snack, i + 3).id, dinner: pickAt(lib.dinner, i + 2).id, prebed: pickAt(lib.prebed, i).id,
  };
}

const ACT_TYPES = {
  padel: { label: "Padel", rate: { low: 3.5, medium: 5, high: 6.5 } },
  run: { label: "Run", rate: { low: 7, medium: 9, high: 11 } },
  crossfit: { label: "CrossFit", rate: { low: 5, medium: 7, high: 9 } },
  other: { label: "Other", rate: { low: 3, medium: 4.5, high: 6 } },
};
// Rough extra energy above baseline. Tracking aid only, not a measurement.
const activityBonus = (activities, key) => activities.filter((a) => a.date === key)
  .reduce((s, a) => s + a.duration * (ACT_TYPES[a.type]?.rate[a.intensity] || 4), 0);

function avg7At(weights, key) {
  const from = addDays(key, -6);
  return avg(Object.entries(weights).filter(([k]) => k >= from && k <= key).map(([, w]) => w));
}
function weightAt(state, key) {
  const ks = Object.keys(state.weights).filter((k) => k <= key).sort();
  if (!ks.length) return state.profile.startWeight;
  return avg7At(state.weights, ks[ks.length - 1]);
}

function baseTargets(profile, w) {
  if (profile.nutritionMode === "manual") { const m = profile.manual; return { kcal: m.kcal, p: m.protein, c: m.carbs, f: m.fat }; }
  const bmr = 10 * w + 6.25 * profile.heightCm - 5 * profile.age + 5;
  const kcal = Math.round((bmr * profile.activity + profile.surplus + profile.kcalAdjust) / 50) * 50;
  const p = Math.round((w * profile.proteinPerKg) / 5) * 5;
  const f = Math.round((kcal * 0.27) / 9 / 5) * 5;
  const c = Math.max(0, Math.round((kcal - p * 4 - f * 9) / 4 / 5) * 5);
  return { kcal, p, c, f };
}

function dayNutrition(state, key) {
  const { profile } = state;
  const base = baseTargets(profile, weightAt(state, key));
  const bonus = Math.round(activityBonus(state.activities, key) / 50) * 50;
  const ids = planMealIds(profile, key);
  const dm = state.days[key]?.meals || {};
  const planned = SLOTS.reduce((s, sl) => s + MEAL_BY_ID[ids[sl]].raw.kcal, 0);
  const f = clamp(base.kcal / planned, 0.7, 1.4);
  const meals = SLOTS.map((slot) => {
    const id = dm[slot]?.swap && MEAL_BY_ID[dm[slot].swap] ? dm[slot].swap : ids[slot];
    return { slot, meal: scaleMeal(MEAL_BY_ID[id], f), eaten: !!dm[slot]?.eaten, swapped: id !== ids[slot] };
  });
  const fuel = bonus >= 250 ? { slot: "fuel", meal: scaleMeal(FUEL, clamp(bonus / FUEL.raw.kcal, 0.6, 2.2)), eaten: !!dm.fuel?.eaten } : null;
  const target = { kcal: base.kcal + bonus, p: base.p, c: base.c + Math.round((bonus * 0.8) / 4), f: base.f + Math.round((bonus * 0.2) / 9) };
  let consumed = ZERO;
  [...meals, ...(fuel ? [fuel] : [])].forEach((m) => { if (m.eaten) consumed = addM(consumed, m.meal); });
  (state.days[key]?.extras || []).forEach((x) => { consumed = addM(consumed, { kcal: x.kcal, p: x.p, c: x.c || 0, f: x.f || 0 }); });
  return { base, bonus, target, meals, fuel, consumed, factor: f, highActivity: bonus >= 400 };
}

function swapOptions(profile, slot, currentId) {
  const cur = MEAL_BY_ID[currentId];
  const lib = filteredLib(profile.prefs)[libFor(slot)].filter((m) => m.id !== currentId);
  return lib.map((m) => ({ m, d: Math.abs(m.raw.kcal - cur.raw.kcal) / cur.raw.kcal + Math.abs(m.raw.p - cur.raw.p) / Math.max(cur.raw.p, 1) }))
    .sort((a, b) => a.d - b.d).slice(0, 3).map((x) => x.m);
}

const SLOT_LABEL = { breakfast: "Breakfast", snack1: "Morning snack", lunch: "Lunch", snack2: "Afternoon snack", dinner: "Dinner", prebed: "Before bed", fuel: "Activity fuel" };

/* ---------- 5. STORE, TASKS, METRICS ---------- */
// Storage adapter: window.storage in Claude artifacts. Swap this object for Supabase later.
const STORE_KEY = "mp:state:v1";
const PHOTO_KEY = (id) => `mp:photo:${id}`;
const storage = {
  async get(k) { try { if (!window.storage) return null; const r = await window.storage.get(k, false); return r ? r.value : null; } catch { return null; } },
  async set(k, v) { try { if (!window.storage) return false; return !!(await window.storage.set(k, v, false)); } catch { return false; } },
  async del(k) { try { if (window.storage) await window.storage.delete(k, false); } catch { /* ignore */ } },
};

function defaultState() {
  // Opened in the evening? Day 1 is tomorrow morning.
  const start = new Date().getHours() >= 18 ? addDays(todayKey(), 1) : todayKey();
  return {
    v: 1,
    profile: {
      name: "Elie", age: 26, heightCm: 190, startWeight: 76, goalWeight: 86, startDate: start,
      sessionsPerWeek: "auto", padelDays: [0, 1, 2], activity: 1.45, surplus: 350, kcalAdjust: 0, proteinPerKg: 2.2,
      nutritionMode: "auto", manual: { kcal: 3200, protein: 170, carbs: 420, fat: 90 },
      waterL: 3, creatine: true, prefs: { noCook: false, noFish: false, noPork: false },
    },
    days: {}, weights: {}, sessions: [], active: null, activities: [], measurements: [], photos: [], checkins: {}, seenAch: [],
  };
}
function migrate(s) {
  const d = defaultState();
  return { ...d, ...s, profile: { ...d.profile, ...(s.profile || {}), prefs: { ...d.profile.prefs, ...(s.profile?.prefs || {}) }, manual: { ...d.profile.manual, ...(s.profile?.manual || {}) } } };
}

const sessionOn = (state, key) => state.sessions.find((s) => s.date === key);

function dayTasks(state, key, nut = dayNutrition(state, key)) {
  const info = dayInfo(state.profile, key);
  const day = state.days[key] || {};
  const h = day.habits || {};
  const T = [];
  const add = (sec, id, label, done, kind, o = {}) => T.push({ sec, id, label, done: !!done, kind, counted: o.counted !== false, ...o });
  const meal = (sec, slot, label, o = {}) => {
    const m = nut.meals.find((x) => x.slot === slot);
    add(sec, `meal:${slot}`, label, m.eaten, "meal", { slot, sub: `${m.meal.name}, ${fmtNum(m.meal.kcal)} kcal`, ...o });
  };
  const w = state.weights[key];
  add("Morning", "weigh", "Morning weigh-in", w != null, "weigh", { sub: w != null ? `${w} kg` : "After waking, before breakfast" });
  meal("Morning", "breakfast", "Breakfast");
  add("Morning", "water", `Water, ${state.profile.waterL} L`, h.water, "manual", { sub: "Spread through the day" });
  if (state.profile.creatine) add("Morning", "creatine", "Creatine, 5 g", h.creatine, "manual", { sub: "Same time every day" });
  meal("Midday", "snack1", "Morning snack");
  meal("Midday", "lunch", "Lunch");
  const sess = sessionOn(state, key);
  const wk = info.tplId ? buildWorkout(info) : null;
  if (wk || sess) add("Training", "gym", sess ? `${sess.name} session` : `${wk.name} session`, !!sess, "gym", { sub: sess ? `Done. ${sess.sets} sets, ${fmtNum(sess.volume)} kg` : `${wk.duration} min. ${wk.focus}` });
  meal("Training", "snack2", wk || sess ? "Post-workout meal" : "Afternoon snack");
  if (nut.fuel) add("Training", "meal:fuel", "Activity fuel", nut.fuel.eaten, "meal", { slot: "fuel", counted: false, sub: `+${fmtNum(nut.fuel.meal.kcal)} kcal for today's activity` });
  meal("Evening", "dinner", "Dinner");
  meal("Evening", "prebed", "Before bed", { counted: false, optional: true });
  const pAuto = nut.consumed.p >= nut.target.p * 0.95;
  const kAuto = nut.consumed.kcal >= nut.target.kcal * 0.95;
  add("Evening", "protein", `Protein target, ${nut.target.p} g`, h.protein ?? pAuto, "auto", { auto: pAuto, sub: `${Math.round(nut.consumed.p)} g eaten. Ticks itself when you hit it.` });
  add("Evening", "kcal", `Calorie target, ${fmtNum(nut.target.kcal)}`, h.kcal ?? kAuto, "auto", { auto: kAuto, sub: `${fmtNum(nut.consumed.kcal)} kcal eaten. Ticks itself when you hit it.` });
  add("Evening", "checkin", "Daily check-in", !!day.checkin, "checkin", { sub: day.checkin ? `Energy ${day.checkin.energy.toLowerCase()}${day.checkin.note ? `. ${day.checkin.note}` : ""}` : "Ten seconds. Energy and a note." });
  return T;
}
const scoreOf = (tasks) => { const c = tasks.filter((t) => t.counted); const d = c.filter((t) => t.done).length; return { done: d, total: c.length, pct: c.length ? Math.round((d / c.length) * 100) : 0 }; };

const LOCK = 80; // a day "counts" for the streak at 80%+
const maxRun = (list, fn) => { let b = 0, r = 0; list.forEach((x) => { if (fn(x)) { r++; b = Math.max(b, r); } else r = 0; }); return b; };

function computeMetrics(state) {
  const today = todayKey();
  const start = state.profile.startDate;
  const n = clamp(diffDays(start, today) + 1, 0, 365);
  const byKey = {};
  const list = [];
  for (let i = 0; i < n; i++) {
    const k = addDays(start, i);
    const nut = dayNutrition(state, k);
    const tasks = dayTasks(state, k, nut);
    const info = dayInfo(state.profile, k);
    const rec = {
      key: k, ...scoreOf(tasks), kcalHit: tasks.find((t) => t.id === "kcal").done, proteinHit: tasks.find((t) => t.id === "protein").done,
      training: !!info.tplId, trained: state.sessions.some((x) => x.date === k), padel: state.activities.some((a) => a.date === k && a.type === "padel"),
    };
    byKey[k] = rec; list.push(rec);
  }
  let cur = 0;
  for (let i = list.length - 1; i >= 0; i--) { if (list[i].pct >= LOCK) cur++; else if (i === list.length - 1) continue; else break; }
  const agg = (arr) => { const d = arr.reduce((s, r) => s + r.done, 0), t = arr.reduce((s, r) => s + r.total, 0); return { done: d, total: t, pct: t ? Math.round((d / t) * 100) : 0 }; };
  const past = list.filter((r) => r.key < today);
  const todayRec = byKey[today] || { done: 0, total: 0, pct: 0 };
  const sched = list.filter((r) => r.training && (r.key < today || r.trained));
  const nutDays = [...past, ...(todayRec.kcalHit ? [todayRec] : [])];
  const discDays = past.length ? past : list;
  const currentW = weightAt(state, today);
  return {
    byKey, list, today: todayRec, cur, best: maxRun(list, (r) => r.pct >= LOCK),
    week: agg(list.filter((r) => r.key >= weekStartOf(today))),
    month: agg(list.filter((r) => r.key.startsWith(today.slice(0, 7)))),
    workoutAdh: sched.length ? Math.round((sched.filter((r) => r.trained).length / sched.length) * 100) : null,
    nutritionAdh: nutDays.length ? Math.round((nutDays.filter((r) => r.kcalHit).length / nutDays.length) * 100) : null,
    discipline: discDays.length ? Math.round(avg(discDays.map((r) => r.pct))) : 0,
    workouts: state.sessions.length, currentW, gain: currentW - state.profile.startWeight,
    hasWeights: Object.keys(state.weights).length > 0,
  };
}

const ACH = [
  { id: "first_blood", name: "First blood", desc: "First workout completed", test: (s, m) => m.workouts >= 1 },
  { id: "full_day", name: "Full day", desc: "First day at 100%", test: (s, m) => m.list.some((r) => r.pct === 100) },
  { id: "first_pr", name: "New ground", desc: "First personal record", test: (s) => s.sessions.some((x) => x.prs > 0) },
  { id: "locked7", name: "7 days locked in", desc: "7 days in a row at 80%+", test: (s, m) => m.best >= 7 },
  { id: "protein", name: "Protein machine", desc: "7 days in a row on protein", test: (s, m) => maxRun(m.list, (r) => r.proteinHit) >= 7 },
  { id: "perfect_week", name: "Perfect week", desc: "Monday to Sunday at 100%", test: (s, m) => {
    const wk = {}; m.list.forEach((r) => { const w = weekStartOf(r.key); (wk[w] = wk[w] || []).push(r); });
    return Object.values(wk).some((a) => a.length === 7 && a.every((r) => r.pct === 100)); } },
  { id: "w25", name: "25 workouts", desc: "25 sessions logged", test: (s, m) => m.workouts >= 25 },
  { id: "consistency30", name: "30 days consistency", desc: "30 days in a row at 80%+", test: (s, m) => m.best >= 30 },
  { id: "kg5", name: "+5 kg", desc: "7-day average 5 kg above start", test: (s, m) => m.hasWeights && m.gain >= 5 },
  { id: "day100", name: "Triple digits", desc: "Day 100 reached", test: (s, m) => m.list.length >= 100 },
  { id: "w100", name: "100 workouts", desc: "100 sessions logged", test: (s, m) => m.workouts >= 100 },
  { id: "kg10", name: "+10 kg", desc: "7-day average 10 kg above start", test: (s, m) => m.hasWeights && m.gain >= 10 },
];

function weekStats(state, m, ws) {
  const days = [...Array(7)].map((_, i) => addDays(ws, i));
  const recs = days.map((k) => m.byKey[k]).filter(Boolean);
  const wOf = (ks) => avg(ks.map((k) => state.weights[k]).filter((v) => v != null));
  const wAvg = wOf(days);
  const pAvg = wOf(days.map((k) => addDays(k, -7)));
  const p2Avg = wOf(days.map((k) => addDays(k, -14)));
  const pctOf = (fn) => (recs.length ? Math.round((recs.filter(fn).length / recs.length) * 100) : 0);
  return {
    days, nDays: recs.length, wAvg, change: wAvg != null && pAvg != null ? wAvg - pAvg : null, twoWeek: wAvg != null && p2Avg != null ? wAvg - p2Avg : null,
    gym: state.sessions.filter((s) => days.includes(s.date)).length,
    planned: days.filter((k) => dayInfo(state.profile, k).tplId).length,
    padel: state.activities.filter((a) => a.type === "padel" && days.includes(a.date)).length,
    kcalAdh: pctOf((r) => r.kcalHit), pAdh: pctOf((r) => r.proteinHit),
    avgScore: recs.length ? Math.round(avg(recs.map((r) => r.pct))) : 0,
  };
}
// Suggestions only. Nothing is applied without a tap.
function weeklySuggestion(st) {
  if (st.wAvg == null) return { text: "Log your weight most mornings. Adjustments need at least two weeks of data.", delta: 0 };
  if (st.twoWeek != null && st.twoWeek < 0.2) {
    if (st.kcalAdh < 70) return { text: `Weight has been flat for 2 weeks, but calories were hit on only ${st.kcalAdh}% of days. Eat the plan fully before adding food.`, delta: 0 };
    return { text: "Weight has not moved for 2 weeks. Consider adding 150 kcal a day.", delta: 150 };
  }
  if (st.change != null && st.change > 0.7) return { text: "You gained more than 0.7 kg this week. Consider removing 100 kcal a day to keep the gain lean.", delta: -100 };
  if (st.change == null) return { text: "First weigh-ins logged. Trends show up after week two.", delta: 0 };
  return { text: "On track. A lean gain is roughly 0.25 to 0.5 kg per week. Keep the plan as is.", delta: 0 };
}

/* ---------- context ---------- */
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

/* ---------- 6. UI PRIMITIVES ---------- */
function Ring({ pct, size = 132, stroke = 7, children }) {
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
const Bar = ({ v, max, white }) => <div className={`bar ${white ? "w" : ""}`}><i style={{ width: `${clamp(max ? (v / max) * 100 : 0, 0, 100)}%` }} /></div>;
const Stat = ({ v, k, lg, red, unit }) => (
  <div className={`stat ${lg ? "lg" : ""}`}>
    <div className={`v d n ${red ? "red" : ""}`}>{v}{unit && <span style={{ fontSize: "0.42em", marginLeft: 3, color: "var(--mute)" }}>{unit}</span>}</div>
    <div className="k">{k}</div>
  </div>
);
function Sheet({ title, onClose, children }) {
  useEffect(() => { const f = (e) => e.key === "Escape" && onClose(); window.addEventListener("keydown", f); return () => window.removeEventListener("keydown", f); }, [onClose]);
  return (
    <div className="ov" onClick={onClose} role="dialog" aria-modal="true">
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-h"><div className="h3 d">{title}</div><button className="ib" onClick={onClose} aria-label="Close"><X size={20} /></button></div>
        <div className="sheet-b">{children}</div>
      </div>
    </div>
  );
}
const Opt = ({ value, options, onChange }) => (
  <div className="opt">{options.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return <button key={v} className={value === v ? "on" : ""} onClick={() => onChange(v)}>{l}</button>; })}</div>
);
const Seg = ({ value, options, onChange }) => (
  <div className="seg">{options.map(([v, l]) => <button key={v} className={value === v ? "on" : ""} onClick={() => onChange(v)}>{l}</button>)}</div>
);
const Field = ({ label, children }) => <label className="field"><span>{label}</span>{children}</label>;
const SecH = ({ title, right }) => <div className="sec-h"><h2 className="h2 d">{title}</h2>{right}</div>;

function MacroBars({ nut, big }) {
  const rows = [["Calories", nut.consumed.kcal, nut.target.kcal, "kcal"], ["Protein", nut.consumed.p, nut.target.p, "g"], ["Carbs", nut.consumed.c, nut.target.c, "g"], ["Fat", nut.consumed.f, nut.target.f, "g"]];
  return (
    <div style={{ display: "grid", gap: big ? 18 : 14 }}>
      {rows.map(([k, v, t, u], i) => (
        <div key={k}>
          <div className="between" style={{ marginBottom: 7 }}>
            <span className="lbl" style={{ color: i < 2 ? "var(--text)" : undefined, fontWeight: 600 }}>{k}</span>
            <span className="n"><b className="d" style={{ fontSize: i === 0 && big ? 26 : 19, fontWeight: 800 }}>{fmtNum(v)}</b><span className="mute"> / {fmtNum(t)} {u}</span></span>
          </div>
          <Bar v={v} max={t} white={i > 1} />
        </div>
      ))}
    </div>
  );
}

function Rail({ week, dayNum }) {
  return <div className="rail" aria-label={`Week ${week} of 52`}>{[...Array(52)].map((_, i) => <i key={i} className={i + 1 < week ? "f" : i + 1 === week && dayNum > 0 ? "c" : ""} />)}</div>;
}

function Heatmap({ metrics, start, onPick, compact }) {
  const today = todayKey();
  const first = weekStartOf(start);
  const cells = [];
  for (let k = first; diffDays(start, k) < 365 || isoDow(k) !== 0; k = addDays(k, 1)) {
    const idx = diffDays(start, k);
    if (idx < 0) { cells.push(<i key={k} style={{ visibility: "hidden" }} />); continue; }
    if (idx >= 365) { cells.push(<i key={k} style={{ visibility: "hidden" }} />); continue; }
    const r = metrics.byKey[k];
    const lv = !r || r.pct === 0 ? "" : r.pct === 100 ? "l5" : r.pct >= 75 ? "l4" : r.pct >= 50 ? "l3" : r.pct >= 25 ? "l2" : "l1";
    cells.push(<i key={k} title={`${fmtShort(k)}${r ? `: ${r.pct}%` : ""}`} onClick={() => onPick && onPick(k)} className={`${k > today ? "fut" : ""} ${lv} ${k === today ? "today" : ""}`} style={{ cursor: onPick ? "pointer" : undefined }} />);
  }
  return (
    <div>
      <div className="scroll-x"><div className="hm" style={{ minWidth: compact ? 0 : 640 }}>{cells}</div></div>
      <div className="row" style={{ gap: 6, marginTop: 10, fontSize: 11, color: "var(--mute)" }}>
        <span>0%</span>{["", "l1", "l2", "l3", "l4", "l5"].map((c) => <i key={c} className={c} style={{ width: 11, height: 11, background: "var(--s2)", display: "inline-block", borderRadius: 1 }} />)}<span>100%</span>
      </div>
    </div>
  );
}

const greeting = () => { const h = new Date().getHours(); return h < 5 ? "Late night" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; };
const QUOTES = ["365 days. No excuses.", "Build the body you said you wanted.", "Today counts.", "Consistency compounds.", "Eat. Lift. Sleep. Repeat.", "Nobody is coming. Go.", "Small days make big years.", "The plan works if you do.", "Show up. Log it. Leave.", "Boring days build big backs."];

/* ---------- 7. PAGES: TODAY ---------- */
function TaskRow({ t, dateKey }) {
  const { actions, open } = useApp();
  const body = () => {
    if (t.kind === "meal") open("recipe", { key: dateKey, slot: t.slot });
    else if (t.kind === "gym") actions.goWorkout(dateKey);
    else if (t.kind === "weigh") open("weigh", { key: dateKey });
    else if (t.kind === "checkin") open("checkin", { key: dateKey });
    else actions.toggleTask(dateKey, t);
  };
  const nav = ["meal", "gym", "weigh", "checkin"].includes(t.kind);
  return (
    <div className={`task ${t.done ? "done" : ""}`}>
      <button className={`chk ${t.done ? "on" : ""} ${t.kind === "auto" && !t.done ? "auto" : ""}`} onClick={() => actions.toggleTask(dateKey, t)} aria-label={`${t.done ? "Uncheck" : "Check"} ${t.label}`}>
        {t.done && <Check size={17} strokeWidth={3} color="#fff" />}
      </button>
      <button className="tl" style={{ textAlign: "left", minWidth: 0 }} onClick={body}>
        <div className="tt">{t.label}{t.optional && <span className="chip" style={{ marginLeft: 8, height: 20, fontSize: 11 }}>optional</span>}</div>
        <div className="ts">{t.sub}</div>
      </button>
      {nav && <span className="go"><ChevronRight size={18} /></span>}
    </div>
  );
}

function Checklist({ tasks, dateKey }) {
  const secs = ["Morning", "Midday", "Training", "Evening"];
  return secs.map((s) => {
    const ts = tasks.filter((t) => t.sec === s);
    if (!ts.length) return null;
    const c = ts.filter((t) => t.counted);
    return (
      <div key={s}>
        <div className="secname between"><span>{s}</span><span className="n">{c.filter((t) => t.done).length}/{c.length}</span></div>
        {ts.map((t) => <TaskRow key={t.id} t={t} dateKey={dateKey} />)}
      </div>
    );
  });
}

function NextUp({ tasks, nut, dateKey }) {
  const { actions, open } = useApp();
  const pending = tasks.filter((t) => t.counted && !t.done);
  const t = pending.find((x) => !["auto", "manual"].includes(x.kind)) || pending.find((x) => x.kind === "manual");
  if (!t) return null;
  const meal = t.kind === "meal" ? nut.meals.find((m) => m.slot === t.slot)?.meal : null;
  return (
    <div className="card" style={{ borderColor: "var(--line2)", padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "16px 18px 0" }}>
        <div className="lbl">Next up</div>
        <div className="h2 d" style={{ fontSize: 30, marginTop: 6 }}>{meal ? meal.name : t.label}</div>
        <div className="mute" style={{ marginTop: 6, fontSize: 14 }}>
          {meal ? `${SLOT_LABEL[t.slot]}. ${fmtNum(meal.kcal)} kcal, ${Math.round(meal.p)} g protein, ${meal.prep ? `${meal.prep} min` : "no prep"}` : t.sub}
        </div>
      </div>
      <div className="row" style={{ padding: 18, gap: 10 }}>
        {t.kind === "meal" && <>
          <button className="btn ghost sm" style={{ flex: 1 }} onClick={() => open("recipe", { key: dateKey, slot: t.slot })}>View recipe</button>
          <button className="btn sm" style={{ flex: 1 }} onClick={() => actions.toggleTask(dateKey, t)}><Check size={18} strokeWidth={3} />Eaten</button>
        </>}
        {t.kind === "gym" && <button className="btn" onClick={() => actions.goWorkout(dateKey)}><Play size={18} fill="#fff" />Start workout</button>}
        {t.kind === "weigh" && <button className="btn" onClick={() => open("weigh", { key: dateKey })}>Log weight</button>}
        {t.kind === "checkin" && <button className="btn" onClick={() => open("checkin", { key: dateKey })}>Check in</button>}
        {t.kind === "manual" && <button className="btn" onClick={() => actions.toggleTask(dateKey, t)}><Check size={18} strokeWidth={3} />Done</button>}
      </div>
    </div>
  );
}

function ActivityBlock({ dateKey, info }) {
  const { state, actions, open } = useApp();
  const acts = state.activities.filter((a) => a.date === dateKey);
  const padelLogged = acts.some((a) => a.type === "padel");
  return (
    <div>
      {info.padelPlanned && !padelLogged && (
        <div className="task">
          <span className="chk auto" />
          <div className="tl"><div className="tt">Padel planned</div><div className="ts">Log it after you play. Adds fuel to today's targets.</div></div>
          <button className="btn xs ghost" onClick={() => open("activity", { key: dateKey, preset: "padel" })}>Log</button>
        </div>
      )}
      {acts.map((a) => (
        <div className="task" key={a.id}>
          <span className="chk on" style={{ animation: "none" }}><Check size={17} strokeWidth={3} color="#fff" /></span>
          <div className="tl"><div className="tt">{ACT_TYPES[a.type].label}, {a.duration} min</div><div className="ts">{a.intensity[0].toUpperCase() + a.intensity.slice(1)} intensity. About +{fmtNum(Math.round(a.duration * ACT_TYPES[a.type].rate[a.intensity] / 50) * 50)} kcal.</div></div>
          <button className="ib" onClick={() => actions.removeActivity(a.id)} aria-label="Remove activity"><Trash2 size={17} /></button>
        </div>
      ))}
      <button className="btn ghost sm" style={{ width: "100%", marginTop: 12 }} onClick={() => open("activity", { key: dateKey })}><Plus size={18} />Add activity</button>
    </div>
  );
}

function TodayPage() {
  const { state, metrics, open, actions, setTab } = useApp();
  const key = todayKey();
  const info = dayInfo(state.profile, key);
  const nut = useMemo(() => dayNutrition(state, key), [state, key]);
  const tasks = useMemo(() => dayTasks(state, key, nut), [state, key, nut]);
  const sc = scoreOf(tasks);
  const name = state.profile.name;

  if (info.idx < 0) {
    return (
      <div className="wrap">
        <div className="lbl">{greeting()}, {name}</div>
        <div className="h1 d" style={{ fontSize: 88, marginTop: 10 }}>T–{-info.idx}</div>
        <p className="mute" style={{ marginTop: 10 }}>Day 1 is {fmtDate(state.profile.startDate)}. Change the start date in Profile.</p>
        <button className="btn" style={{ marginTop: 24, maxWidth: 360 }} onClick={() => actions.updateProfile({ startDate: key })}>Start today instead</button>
      </div>
    );
  }
  if (info.idx >= 365) {
    return (
      <div className="wrap">
        <div className="h1 d" style={{ fontSize: 72 }}>Mission complete.</div>
        <p className="mute" style={{ marginTop: 12 }}>365 days done. Gain: {fmtKg(metrics.gain, true)} kg, {metrics.workouts} workouts.</p>
        <button className="btn" style={{ marginTop: 24, maxWidth: 360 }} onClick={() => setTab("progress")}>See the year</button>
      </div>
    );
  }

  const yKey = addDays(key, -1);
  const yRec = metrics.byKey[yKey];
  const showBack = yRec && yRec.pct < LOCK && sc.pct < 50;
  const ws = weekStartOf(key);
  const reviewDue = (isoDow(key) === 6 && !state.checkins[ws]) || (isoDow(key) === 0 && info.idx >= 7 && !state.checkins[addDays(ws, -7)]);
  const reviewWeek = isoDow(key) === 6 ? ws : addDays(ws, -7);
  const pctMission = Math.round((info.dayNum / 365) * 100);

  return (
    <div className="wrap">
      <div className="two">
        <div>
          <div className="lbl" style={{ fontSize: 14 }}>{greeting()}, {name}</div>
          <div className="d n" style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: "clamp(64px, 20vw, 132px)", whiteSpace: "nowrap", fontWeight: 900, lineHeight: 0.8 }}>DAY {pad(info.dayNum, 3)}</span>
            <span className="dim" style={{ fontSize: 26, fontWeight: 800, paddingBottom: 2 }}>/365</span>
          </div>
          <div className="row" style={{ marginTop: 14, gap: 10, flexWrap: "wrap" }}>
            <span className="chip r">Phase {info.phase.id}: {info.phase.name}</span>
            <span className="chip">Week {info.weekInPhase} of {info.phaseWeeks}</span>
            {info.deload && <span className="chip">Deload</span>}
            {nut.highActivity && <span className="chip r"><Zap size={13} />High activity day</span>}
          </div>
          <div style={{ marginTop: 16 }}><Rail week={info.week} dayNum={info.dayNum} /></div>
          <p className="d up" style={{ fontSize: 22, fontWeight: 700, marginTop: 16, color: "var(--mute)" }}>{QUOTES[info.idx % QUOTES.length]}</p>

          <div className="card" style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 20 }}>
            <Ring pct={sc.pct}>
              <div className="d n" style={{ fontSize: 46, fontWeight: 900, lineHeight: 0.9 }}>{sc.pct}<span style={{ fontSize: 20 }}>%</span></div>
              <div className="lbl" style={{ fontSize: 11 }}>Today score</div>
            </Ring>
            <div style={{ display: "grid", gap: 14, flex: 1 }}>
              <div><div className="d n" style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>{sc.done} / {sc.total}</div><div className="lbl">Done today</div></div>
              <div className="grid2" style={{ gap: 12 }}>
                <div><div className="d n" style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{metrics.cur}<span className="mute" style={{ fontSize: 13 }}> days</span></div><div className="lbl">Streak</div></div>
                <div><div className="d n" style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{metrics.week.pct}%</div><div className="lbl">This week</div></div>
              </div>
            </div>
          </div>

          {showBack && (
            <div className="card flat" style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 18 }}>
              <div><div className="d n" style={{ fontSize: 28, fontWeight: 800 }}>{yRec.pct}%</div><div className="lbl">Yesterday</div></div>
              <div><div className="d n" style={{ fontSize: 28, fontWeight: 800 }}>{sc.pct}%</div><div className="lbl">Today</div></div>
              <div className="d up red" style={{ fontSize: 26, fontWeight: 900, marginLeft: "auto" }}>Back to work.</div>
            </div>
          )}

          {state.active && (
            <button className="card" style={{ marginTop: 12, width: "100%", textAlign: "left", borderColor: "var(--red)" }} onClick={() => actions.goWorkout(state.active.date)}>
              <div className="between"><div><div className="lbl">Workout in progress</div><div className="h3 d" style={{ marginTop: 4 }}>{state.active.name}</div></div><span className="btn sm">Resume</span></div>
            </button>
          )}

          {reviewDue && (
            <button className="card" style={{ marginTop: 12, width: "100%", textAlign: "left" }} onClick={() => open("review", { ws: reviewWeek })}>
              <div className="between"><div><div className="lbl">Weekly review is ready</div><div className="h3 d" style={{ marginTop: 4 }}>Close the week</div></div><ChevronRight size={20} /></div>
            </button>
          )}

          <div style={{ marginTop: 12 }}><NextUp tasks={tasks} nut={nut} dateKey={key} /></div>

          <div className="sec" style={{ marginTop: 18 }}>
            <Checklist tasks={tasks} dateKey={key} />
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <div className="between" style={{ marginBottom: 16 }}>
              <h2 className="h3 d">Fuel</h2>
              <button className="chip" onClick={() => setTab("nutrition")}>Meals<ChevronRight size={13} /></button>
            </div>
            <MacroBars nut={nut} />
            {nut.highActivity && <p className="lbl" style={{ marginTop: 14 }}>Big activity day: +{fmtNum(nut.bonus)} kcal added. Activity fuel snack is on your list.</p>}
          </div>
          <div className="card">
            <h2 className="h3 d" style={{ marginBottom: 6 }}>Activity</h2>
            <ActivityBlock dateKey={key} info={info} />
          </div>
          <div className="card">
            <h2 className="h3 d" style={{ marginBottom: 16 }}>The mission</h2>
            <div className="grid2" style={{ rowGap: 22 }}>
              <Stat v={`${pctMission}%`} k="Of the transformation complete" red />
              <Stat v={metrics.cur} k="Current streak" />
              <Stat v={metrics.hasWeights ? fmtKg(metrics.gain, true) : "–"} unit="kg" k="Weight gain, 7-day avg" />
              <Stat v={metrics.workouts} k="Workouts" />
              <Stat v={`${metrics.discipline}%`} k="Discipline score" />
              <Stat v={metrics.best} k="Best streak" />
            </div>
          </div>
          <div className="card">
            <div className="between" style={{ marginBottom: 14 }}><h2 className="h3 d">365</h2><button className="chip" onClick={() => setTab("calendar")}>Calendar<ChevronRight size={13} /></button></div>
            <Heatmap metrics={metrics} start={state.profile.startDate} compact onPick={(k) => open("day", { key: k })} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 7. PAGES: TRAINING ---------- */
function missedThisWeek(state, key) {
  const ws = weekStartOf(key);
  const doneTpl = state.sessions.filter((s) => s.date >= ws && s.date <= key).map((s) => s.tplId);
  const out = [];
  for (let k = ws; k < key; k = addDays(k, 1)) {
    const inf = dayInfo(state.profile, k);
    if (inf.inProgram && inf.tplId && !doneTpl.includes(inf.tplId)) out.push(inf.tplId);
  }
  return out;
}

function ExerciseLine({ x, sessions }) {
  const last = lastPerformance(sessions, x.exId);
  const tgt = targetFor(sessions, x.exId, x.reps);
  return (
    <div className="task" style={{ alignItems: "flex-start" }}>
      <div className="tl">
        <div className="tt">{x.name}</div>
        <div className="ts">{x.m}. Rest {x.rest >= 120 ? `${x.rest / 60} min` : `${x.rest} s`}</div>
        {last && <div className="ts" style={{ marginTop: 3 }}>Last: {last.sets.map((s) => `${s.w}×${s.r}`).join(", ")}. <span className="red">{tgt.text}</span></div>}
      </div>
      <div className="d n" style={{ fontSize: 22, fontWeight: 800, whiteSpace: "nowrap" }}>{x.sets} × {x.reps[0]}-{x.reps[1]}</div>
    </div>
  );
}

function TrainingPage() {
  const { state, actions, open } = useApp();
  const key = todayKey();
  const info = dayInfo(state.profile, key);
  const sess = sessionOn(state, key);
  const missed = missedThisWeek(state, key);
  const tpl = info.tplId || missed[0] || null;
  const wk = buildWorkout(info, tpl);
  const ws = weekStartOf(key);
  const lifts = useMemo(() => {
    const ids = [...new Set(state.sessions.flatMap((s) => s.exercises.map((x) => x.exId)))];
    return ids.map((id) => ({ id, best: bestSetOf(state.sessions, id) })).filter((x) => x.best && x.best.w > 0).sort((a, b) => e1rm(b.best.w, b.best.r) - e1rm(a.best.w, a.best.r));
  }, [state.sessions]);

  return (
    <div className="wrap">
      <div className="lbl">Week {info.week} of 52</div>
      <h1 className="h1 d" style={{ marginTop: 6 }}>Training</h1>
      <div className="two" style={{ marginTop: 22 }}>
        <div>
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: 18 }}>
              {!info.tplId && <div className="chip" style={{ marginBottom: 12 }}>{missed.length ? `Rest day. Catch-up available` : "Rest day"}</div>}
              {wk ? <>
                <div className="lbl">{info.tplId ? "Today" : "Catch up on this week's missed session"}</div>
                <div className="d up" style={{ fontSize: 54, fontWeight: 900, lineHeight: 0.9, marginTop: 6 }}>{wk.name}</div>
                <div className="mute" style={{ marginTop: 8 }}>{wk.focus}</div>
                <div className="row" style={{ gap: 24, marginTop: 16 }}>
                  <Stat v={wk.duration} unit="min" k="Duration" />
                  <Stat v={wk.exercises.length} k="Exercises" />
                  <Stat v={wk.exercises.reduce((s, x) => s + x.sets, 0)} k="Sets" />
                </div>
                <p className="lbl" style={{ marginTop: 14 }}>{wk.note}</p>
              </> : <>
                <div className="d up" style={{ fontSize: 54, fontWeight: 900, lineHeight: 0.9 }}>Recover</div>
                <p className="mute" style={{ marginTop: 10 }}>No lifting today. Padel, a walk, eat the plan, sleep 8 hours. Muscle grows on these days.</p>
              </>}
            </div>
            {wk && <div style={{ padding: "0 18px 18px" }}>
              {sess ? <div className="btn ghost" style={{ pointerEvents: "none" }}><Check size={18} />Done today. {sess.sets} sets</div>
                : state.active ? <button className="btn" onClick={() => actions.goWorkout(state.active.date)}>Resume workout</button>
                : <button className="btn" onClick={() => actions.startWorkout(key, tpl)}><Play size={18} fill="#fff" />Start workout</button>}
            </div>}
          </div>
          {wk && <div className="sec">
            <SecH title="The session" />
            {wk.exercises.map((x) => <ExerciseLine key={x.exId} x={x} sessions={state.sessions} />)}
          </div>}
        </div>

        <div>
          <SecH title="This week" />
          <div className="card" style={{ padding: "4px 16px" }}>
            {[...Array(7)].map((_, i) => {
              const k = addDays(ws, i);
              const inf = dayInfo(state.profile, k);
              const done = sessionOn(state, k);
              const padel = state.activities.some((a) => a.date === k && a.type === "padel");
              const t = inf.tplId ? TEMPLATES[inf.tplId] : null;
              return (
                <button key={k} className="task" style={{ width: "100%", textAlign: "left", minHeight: 52 }} onClick={() => open("day", { key: k })}>
                  <span className="d" style={{ width: 40, fontWeight: 800, color: k === key ? "var(--red)" : "var(--mute)" }}>{DOW3[i]}</span>
                  <div className="tl"><div className="tt" style={{ textDecoration: "none", color: t ? "var(--text)" : "var(--dim)" }}>{done ? done.name : t ? t.name : "Rest"}</div></div>
                  {(inf.padelPlanned || padel) && <span className={`chip ${padel ? "r" : ""}`}>Padel</span>}
                  {done ? <span className="chk on" style={{ animation: "none" }}><Check size={16} strokeWidth={3} color="#fff" /></span> : <span className="chk" style={{ opacity: t ? 1 : 0.2 }} />}
                </button>
              );
            })}
          </div>

          <div className="sec">
            <SecH title="12-month program" />
            <div style={{ display: "grid", gridTemplateColumns: "8fr 12fr 12fr 12fr 8fr", gap: 3 }}>
              {PHASES.map((p) => <div key={p.id} style={{ height: 8, background: p.id < info.phase.id ? "var(--red)" : p.id === info.phase.id ? "var(--text)" : "var(--s3)" }} />)}
            </div>
            <div style={{ marginTop: 14 }}>
              {PHASES.map((p) => (
                <div key={p.id} className="task" style={{ opacity: p.id < info.phase.id ? 0.5 : 1, alignItems: "flex-start" }}>
                  <span className="d n" style={{ fontSize: 22, fontWeight: 900, width: 26, color: p.id === info.phase.id ? "var(--red)" : "var(--dim)" }}>{p.id}</span>
                  <div className="tl"><div className="tt">{p.name} <span className="mute" style={{ fontWeight: 400, fontSize: 13 }}>weeks {p.weeks[0]}-{p.weeks[1]}</span></div><div className="mute" style={{ fontSize: 13 }}>{p.goal}</div></div>
                </div>
              ))}
            </div>
          </div>

          <div className="sec">
            <SecH title="Best lifts" />
            {lifts.length ? <table className="tbl"><tbody>{lifts.slice(0, 12).map((l) => (
              <tr key={l.id}><td>{EX[l.id].name}</td><td className="n" style={{ textAlign: "right", fontWeight: 700 }}>{l.best.w} kg × {l.best.r}</td></tr>
            ))}</tbody></table> : <p className="mute">Finish your first session to start the logbook.</p>}
          </div>

          <div className="sec">
            <SecH title="History" />
            {state.sessions.length ? [...state.sessions].reverse().slice(0, 10).map((s) => (
              <div key={s.id} className="task">
                <div className="tl"><div className="tt">{s.name}</div><div className="ts">{fmtDate(s.date)}. {fmtDur(s.endedAt - s.startedAt)}, {s.sets} sets</div></div>
                <div style={{ textAlign: "right" }}><div className="d n" style={{ fontSize: 20, fontWeight: 800 }}>{fmtNum(s.volume)} kg</div>{s.prs > 0 && <div className="lbl red">{s.prs} PR</div>}</div>
              </div>
            )) : <p className="mute">No sessions yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 8. WORKOUT MODE ---------- */
function Stepper({ value, onChange, step, label }) {
  const num = value === "" || value == null ? null : Number(value);
  const bump = (d) => onChange(String(Math.max(0, +(((num ?? 0) + d).toFixed(2)))));
  return (
    <div style={{ flex: 1 }}>
      <div className="lbl" style={{ marginBottom: 6 }}>{label}</div>
      <div className="stepper">
        <button onClick={() => bump(-step)} aria-label={`Decrease ${label}`}><Minus size={18} /></button>
        <input inputMode="decimal" value={value ?? ""} onChange={(e) => onChange(e.target.value.replace(",", "."))} aria-label={label} />
        <button onClick={() => bump(step)} aria-label={`Increase ${label}`}><Plus size={18} /></button>
      </div>
    </div>
  );
}

function WorkoutMode({ onClose }) {
  const { state, update, actions } = useApp();
  const a = state.active;
  const [now, setNow] = useState(Date.now());
  const [swap, setSwap] = useState(false);
  const [confirm, setConfirm] = useState(false);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(t); }, []);
  const restLeft = a.restEnd ? Math.ceil((a.restEnd - now) / 1000) : 0;
  const prevRest = useRef(restLeft);
  useEffect(() => {
    if (prevRest.current > 0 && restLeft <= 0) { try { navigator.vibrate && navigator.vibrate([180, 90, 180]); } catch { /* unsupported */ } }
    prevRest.current = restLeft;
  }, [restLeft]);

  const ex = a.exercises[a.idx];
  const meta = EX[ex.exId];
  const last = lastPerformance(state.sessions, ex.exId);
  const tgt = targetFor(state.sessions, ex.exId, ex.reps);
  const best = bestSetOf(state.sessions, ex.exId);
  const cur = ex.sets.findIndex((s) => !s.done);
  const allDone = a.exercises.every((x) => x.sets.every((s) => s.done));
  const doneSets = a.exercises.reduce((s, x) => s + x.sets.filter((y) => y.done).length, 0);

  const mut = (fn) => update((d) => fn(d.active, d.active.exercises[d.active.idx]));
  const setVal = (j, f, v) => mut((A, X) => { X.sets[j][f] = v; });
  const saveSet = (j) => mut((A, X) => {
    const s = X.sets[j];
    s.w = Number(s.w) || 0; s.r = Number(s.r) || 0; s.done = true;
    const n = X.sets[j + 1];
    if (n && !n.done) { if (n.w === "" || n.w == null) n.w = String(s.w); if (n.r === "" || n.r == null) n.r = String(s.r); }
    const isLast = j === X.sets.length - 1;
    A.restEnd = Date.now() + X.rest * 1000;
    if (isLast && A.idx === A.exercises.length - 1) A.restEnd = null;
  });
  const goto = (i) => update((d) => { d.active.idx = clamp(i, 0, d.active.exercises.length - 1); });
  const swapTo = (id) => {
    const t = targetFor(state.sessions, id, ex.reps);
    mut((A, X) => { X.exId = id; X.sets = X.sets.map((s) => (s.done ? s : { w: t.w != null ? String(t.w) : "", r: String(t.r), done: false })); });
    setSwap(false);
  };

  return (
    <div className="wm mp">
      <div className="wm-in">
        <div className="between" style={{ padding: "12px 0", position: "sticky", top: 0, background: "var(--bg)", zIndex: 3 }}>
          <button className="ib" onClick={onClose} aria-label="Minimize workout"><X size={22} /></button>
          <div className="d up" style={{ fontWeight: 800, fontSize: 17, letterSpacing: ".08em" }}>Exercise {a.idx + 1} / {a.exercises.length}</div>
          <div className="d n" style={{ fontWeight: 800, fontSize: 19, width: 64, textAlign: "right" }}>{fmtClock(Math.floor((now - a.startedAt) / 1000))}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${a.exercises.length},1fr)`, gap: 3 }}>
          {a.exercises.map((x, i) => (
            <button key={i} onClick={() => goto(i)} aria-label={`Go to exercise ${i + 1}`} style={{ height: 22, display: "flex", alignItems: "center" }}>
              <span style={{ display: "block", width: "100%", height: 4, background: x.sets.every((s) => s.done) ? "var(--red)" : i === a.idx ? "var(--text)" : "var(--s3)" }} />
            </button>
          ))}
        </div>

        {restLeft > 0 && (
          <div className="rest" style={{ marginTop: 12, position: "sticky", top: 62, zIndex: 3 }}>
            <div className="row" style={{ gap: 10 }}><Timer size={20} /><span className="d n" style={{ fontSize: 34, fontWeight: 900, lineHeight: 1 }}>{fmtClock(restLeft)}</span><span style={{ fontWeight: 600, fontSize: 13 }}>Rest</span></div>
            <div className="row" style={{ gap: 4 }}>
              <button className="btn xs" style={{ background: "rgba(0,0,0,.2)" }} onClick={() => update((d) => { d.active.restEnd -= 15000; })}>-15</button>
              <button className="btn xs" style={{ background: "rgba(0,0,0,.2)" }} onClick={() => update((d) => { d.active.restEnd += 15000; })}>+15</button>
              <button className="btn xs" style={{ background: "rgba(0,0,0,.2)" }} onClick={() => update((d) => { d.active.restEnd = null; })} aria-label="Skip rest"><SkipForward size={16} /></button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 22 }}>
          <div className="lbl">{meta.m}</div>
          <h1 className="d up" style={{ fontSize: "clamp(40px, 11vw, 60px)", fontWeight: 900, lineHeight: 0.9, marginTop: 6 }}>{meta.name}</h1>
          <div className="row" style={{ marginTop: 14, gap: 8, flexWrap: "wrap" }}>
            <span className="chip r">Target {ex.sets.length} × {ex.reps[0]}-{ex.reps[1]}</span>
            <span className="chip">Rest {ex.rest >= 120 ? `${ex.rest / 60} min` : `${ex.rest} s`}</span>
            <button className="chip" onClick={() => setSwap(true)}><ArrowLeftRight size={13} />Swap exercise</button>
          </div>
        </div>

        <div className="grid2" style={{ marginTop: 18 }}>
          <div className="card" style={{ padding: 14 }}>
            <div className="lbl">Last time</div>
            {last ? last.sets.map((s, i) => <div key={i} className="d n" style={{ fontSize: 20, fontWeight: 800, marginTop: i ? 0 : 6 }}>{s.w} kg × {s.r}</div>) : <div className="mute" style={{ marginTop: 6, fontSize: 14 }}>No history yet</div>}
            {best && <div className="lbl" style={{ marginTop: 8 }}>Best {best.w} kg × {best.r}</div>}
          </div>
          <div className="card" style={{ padding: 14, borderColor: "rgba(232,41,28,.4)" }}>
            <div className="lbl">Target today</div>
            <div className="d" style={{ fontSize: 22, fontWeight: 800, marginTop: 6, lineHeight: 1.1 }}>{tgt.text}</div>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          {ex.sets.map((s, j) => (
            j === cur ? (
              <div key={j} style={{ padding: "16px 0", borderBottom: "1px solid var(--line)" }}>
                <div className="d up" style={{ fontWeight: 800, fontSize: 18, marginBottom: 10 }}>Set {j + 1}</div>
                <div className="row" style={{ gap: 10 }}>
                  <Stepper label="Weight, kg" value={s.w} step={meta.inc} onChange={(v) => setVal(j, "w", v)} />
                  <Stepper label="Reps" value={s.r} step={1} onChange={(v) => setVal(j, "r", v)} />
                </div>
                <button className="btn" style={{ marginTop: 12 }} disabled={s.r === "" || Number(s.r) <= 0} onClick={() => saveSet(j)}><Check size={20} strokeWidth={3} />Save set</button>
              </div>
            ) : (
              <div key={j} className="setrow" style={{ opacity: s.done ? 1 : 0.4 }}>
                <span className={`chk ${s.done ? "on" : ""}`} style={{ animation: s.done ? undefined : "none" }}>{s.done && <Check size={16} strokeWidth={3} color="#fff" />}</span>
                <span className="d up" style={{ fontWeight: 800, width: 54 }}>Set {j + 1}</span>
                <span className="d n" style={{ flex: 1, fontSize: 22, fontWeight: 800 }}>{s.done ? `${s.w} kg × ${s.r}` : `${s.w || "–"} kg × ${ex.reps[0]}-${ex.reps[1]}`}</span>
                {s.done && <button className="chip" onClick={() => mut((A, X) => { X.sets[j].done = false; })}>Edit</button>}
              </div>
            )
          ))}
          <div className="row" style={{ marginTop: 12, gap: 8 }}>
            <button className="chip" onClick={() => mut((A, X) => { const l = X.sets[X.sets.length - 1]; X.sets.push({ w: l ? String(l.w) : "", r: "", done: false }); })}><Plus size={13} />Add set</button>
            {ex.sets.length > 1 && !ex.sets[ex.sets.length - 1].done && <button className="chip" onClick={() => mut((A, X) => { X.sets.pop(); })}><Minus size={13} />Remove set</button>}
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 28 }} />
        <div className="row" style={{ gap: 10, paddingTop: 12 }}>
          <button className="btn ghost" style={{ width: 64, padding: 0 }} disabled={a.idx === 0} onClick={() => goto(a.idx - 1)} aria-label="Previous exercise"><ChevronLeft size={22} /></button>
          {a.idx < a.exercises.length - 1
            ? <button className={`btn ${cur === -1 ? "" : "ghost"}`} onClick={() => goto(a.idx + 1)}>Next exercise<ChevronRight size={20} /></button>
            : <button className={`btn ${allDone ? "" : "ghost"}`} onClick={() => (allDone ? actions.finishWorkout() : setConfirm(true))}>Finish workout</button>}
        </div>
        {a.idx < a.exercises.length - 1 && <button className="lbl" style={{ marginTop: 14, alignSelf: "center", textDecoration: "underline" }} onClick={() => setConfirm(true)}>Finish workout now</button>}
      </div>

      {swap && (
        <Sheet title="Swap exercise" onClose={() => setSwap(false)}>
          <p className="mute" style={{ marginBottom: 12 }}>Machine taken? Same muscles, same targets.</p>
          {[...(meta.alt || [])].map((id) => (
            <button key={id} className="task" style={{ width: "100%", textAlign: "left" }} onClick={() => swapTo(id)}>
              <div className="tl"><div className="tt">{EX[id].name}</div><div className="ts">{EX[id].m}</div></div><ChevronRight size={18} />
            </button>
          ))}
        </Sheet>
      )}
      {confirm && (
        <Sheet title="Finish workout?" onClose={() => setConfirm(false)}>
          <p className="mute">{doneSets} sets logged. Unlogged sets are dropped.</p>
          <button className="btn" style={{ marginTop: 18 }} disabled={!doneSets} onClick={() => { setConfirm(false); actions.finishWorkout(); }}>Finish and save</button>
          <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => setConfirm(false)}>Keep training</button>
          <button className="lbl" style={{ marginTop: 18, width: "100%", textDecoration: "underline" }} onClick={() => { setConfirm(false); actions.discardWorkout(); }}>Discard this workout</button>
        </Sheet>
      )}
    </div>
  );
}

function WorkoutSummary({ s, onDone }) {
  return (
    <div className="complete mp" style={{ background: "var(--bg)", zIndex: 96 }}>
      <div className="d up" style={{ fontSize: 22, fontWeight: 800, letterSpacing: ".12em", color: "var(--mute)" }}>{s.name}</div>
      <div className="d up" style={{ fontSize: "clamp(56px, 16vw, 110px)", fontWeight: 900, lineHeight: 0.85, marginTop: 10, animation: "slam .6s cubic-bezier(.2,1.4,.4,1)" }}>Workout<br /><span className="red">complete</span></div>
      <div className="grid2" style={{ marginTop: 34, gap: 28, maxWidth: 420, width: "100%", textAlign: "left" }}>
        <Stat v={fmtDur(s.endedAt - s.startedAt)} k="Duration" />
        <Stat v={s.sets} k="Total sets" />
        <Stat v={fmtNum(s.volume)} unit="kg" k="Total volume" />
        <Stat v={s.prs} k="New PRs" red={s.prs > 0} />
      </div>
      {s.prList?.length > 0 && <div style={{ marginTop: 22, maxWidth: 420, width: "100%", textAlign: "left" }}>{s.prList.map((p) => <div key={p} className="row" style={{ gap: 8, padding: "6px 0" }}><Trophy size={15} color="var(--red)" /><span style={{ fontSize: 14 }}>{p}</span></div>)}</div>}
      <button className="btn" style={{ marginTop: 34, maxWidth: 420 }} onClick={onDone}>Done</button>
    </div>
  );
}

/* ---------- 7. PAGES: NUTRITION ---------- */
const MealTile = ({ meal }) => <div className="tile"><b className="n">{Math.round(meal.p)}</b><span>PROT</span></div>;

function MealCard({ dateKey, item, label }) {
  const { actions, open } = useApp();
  const m = item.meal;
  return (
    <div className="meal" style={{ borderColor: item.eaten ? "rgba(232,41,28,.35)" : undefined }}>
      <MealTile meal={m} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="lbl">{label}{m.noCook ? ". No cooking" : m.prep ? `. ${m.prep} min` : ""}</div>
        <button className="h3 d" style={{ marginTop: 3, textAlign: "left", fontSize: 21 }} onClick={() => open("recipe", { key: dateKey, slot: item.slot })}>{m.name}</button>
        <div className="mute n" style={{ fontSize: 13, marginTop: 4 }}>{fmtNum(m.kcal)} kcal. P {Math.round(m.p)} g. C {Math.round(m.c)} g. F {Math.round(m.f)} g</div>
        <div className="row" style={{ marginTop: 12, gap: 8 }}>
          <button className="btn xs ghost" onClick={() => open("recipe", { key: dateKey, slot: item.slot })}>Recipe</button>
          <button className={`btn xs ${item.eaten ? "" : "ghost"}`} onClick={() => actions.toggleMeal(dateKey, item.slot)}><Check size={15} strokeWidth={3} />{item.eaten ? "Eaten" : "Mark eaten"}</button>
        </div>
      </div>
    </div>
  );
}

function QuickAdd({ dateKey }) {
  const { state, actions } = useApp();
  const [f, setF] = useState({ label: "", kcal: "", p: "" });
  const extras = state.days[dateKey]?.extras || [];
  const ok = f.label && Number(f.kcal) > 0;
  return (
    <div>
      {extras.map((x) => (
        <div key={x.id} className="task"><div className="tl"><div className="tt">{x.label}</div><div className="ts">{fmtNum(x.kcal)} kcal, {x.p} g protein</div></div>
          <button className="ib" onClick={() => actions.removeExtra(dateKey, x.id)} aria-label="Remove"><Trash2 size={17} /></button></div>
      ))}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8, marginTop: 10 }}>
        <input placeholder="Off-plan food" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} />
        <input placeholder="kcal" inputMode="numeric" value={f.kcal} onChange={(e) => setF({ ...f, kcal: e.target.value })} />
        <input placeholder="prot g" inputMode="numeric" value={f.p} onChange={(e) => setF({ ...f, p: e.target.value })} />
      </div>
      <button className="btn sm ghost" style={{ width: "100%", marginTop: 8 }} disabled={!ok}
        onClick={() => { actions.addExtra(dateKey, { label: f.label, kcal: Number(f.kcal), p: Number(f.p) || 0 }); setF({ label: "", kcal: "", p: "" }); }}><Plus size={16} />Add food</button>
    </div>
  );
}

function DayNav({ k, setK }) {
  const t = todayKey();
  return (
    <div className="row" style={{ gap: 4 }}>
      <button className="ib" onClick={() => setK(addDays(k, -1))} aria-label="Previous day"><ChevronLeft size={20} /></button>
      <button className="chip" style={{ height: 34, minWidth: 110, justifyContent: "center" }} onClick={() => setK(t)}>{k === t ? "Today" : fmtShort(k)}</button>
      <button className="ib" onClick={() => setK(addDays(k, 1))} aria-label="Next day"><ChevronRight size={20} /></button>
    </div>
  );
}

function NutritionPage() {
  const { state, open } = useApp();
  const [k, setK] = useState(todayKey());
  const nut = useMemo(() => dayNutrition(state, k), [state, k]);
  const training = !!dayInfo(state.profile, k).tplId || !!sessionOn(state, k);
  const items = [...nut.meals, ...(nut.fuel ? [nut.fuel] : [])];
  return (
    <div className="wrap">
      <div className="between" style={{ flexWrap: "wrap" }}>
        <div><div className="lbl">{fmtDate(k)}</div><h1 className="h1 d" style={{ marginTop: 6 }}>Nutrition</h1></div>
        <DayNav k={k} setK={setK} />
      </div>
      <div className="two" style={{ marginTop: 22 }}>
        <div className="stack" style={{ gap: 10 }}>
          {items.map((it) => <MealCard key={it.slot} dateKey={k} item={it} label={it.slot === "snack2" && training ? "Post-workout" : SLOT_LABEL[it.slot]} />)}
        </div>
        <div className="stack">
          <div className="card">
            <h2 className="h3 d" style={{ marginBottom: 16 }}>Daily target</h2>
            <MacroBars nut={nut} big />
            {nut.bonus > 0 && <p className="lbl" style={{ marginTop: 14 }}>Includes +{fmtNum(nut.bonus)} kcal from today's activity. Estimate only.</p>}
          </div>
          <div className="card">
            <h2 className="h3 d" style={{ marginBottom: 4 }}>Ate something else?</h2>
            <p className="lbl">Log it so the targets stay honest.</p>
            <QuickAdd dateKey={k} />
          </div>
          <button className="card" style={{ textAlign: "left" }} onClick={() => open("groceries", {})}>
            <div className="between"><div className="row"><ShoppingBasket size={20} color="var(--red)" /><div><div className="h3 d">Groceries</div><div className="lbl">Everything for the next 7 days</div></div></div><ChevronRight size={20} /></div>
          </button>
          <p className="lbl">Portions scale to your calorie target automatically. Targets are estimates for tracking, not medical advice. Change them in Profile.</p>
        </div>
      </div>
    </div>
  );
}

function RecipeSheet({ dateKey, slot, onClose }) {
  const { state, actions } = useApp();
  const nut = dayNutrition(state, dateKey);
  const item = slot === "fuel" ? nut.fuel : nut.meals.find((m) => m.slot === slot);
  const [showSwap, setShowSwap] = useState(false);
  if (!item) return null;
  const m = item.meal;
  const alts = slot === "fuel" ? [] : swapOptions(state.profile, slot, m.id).map((a) => scaleMeal(a, nut.factor));
  return (
    <Sheet title={SLOT_LABEL[slot]} onClose={onClose}>
      <h2 className="d up" style={{ fontSize: 40, fontWeight: 900, lineHeight: 0.92 }}>{m.name}</h2>
      <div className="grid3" style={{ marginTop: 20 }}>
        <Stat v={fmtNum(m.kcal)} k="Calories" />
        <Stat v={Math.round(m.p)} unit="g" k="Protein" red />
        <Stat v={m.noCook && !m.prep ? "0" : m.prep} unit="min" k="Prep" />
      </div>
      <div className="mute n" style={{ fontSize: 13, marginTop: 12 }}>Carbs {Math.round(m.c)} g. Fat {Math.round(m.f)} g</div>
      {m.tip && <p style={{ marginTop: 14, fontSize: 14, borderLeft: "2px solid var(--red)", paddingLeft: 12 }}>{m.tip}</p>}
      <div className="sec" style={{ marginTop: 24 }}>
        <h3 className="h3 d" style={{ marginBottom: 6 }}>Ingredients</h3>
        <table className="tbl"><tbody>{m.ing.map(([fid, q]) => (
          <tr key={fid}><td>{FOODS[fid][0]}</td><td className="n" style={{ textAlign: "right", fontWeight: 700, whiteSpace: "nowrap" }}>{fmtQty(fid, q)}</td></tr>
        ))}</tbody></table>
      </div>
      <div className="sec" style={{ marginTop: 22 }}>
        <h3 className="h3 d" style={{ marginBottom: 10 }}>Instructions</h3>
        <ol style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "grid", gap: 12 }}>
          {m.steps.map((s, i) => <li key={i} className="row" style={{ alignItems: "flex-start" }}><span className="d n red" style={{ fontWeight: 900, fontSize: 20, width: 20, lineHeight: 1.1 }}>{i + 1}</span><span style={{ flex: 1 }}>{s}</span></li>)}
        </ol>
      </div>
      <div className="row" style={{ marginTop: 26, gap: 10 }}>
        {alts.length > 0 && <button className="btn ghost sm" style={{ flex: 1 }} onClick={() => setShowSwap(!showSwap)}><RefreshCw size={16} />Swap meal</button>}
        <button className={`btn sm ${item.eaten ? "ghost" : ""}`} style={{ flex: 1 }} onClick={() => { actions.toggleMeal(dateKey, slot); if (!item.eaten) onClose(); }}>
          <Check size={17} strokeWidth={3} />{item.eaten ? "Unmark" : "Mark as eaten"}
        </button>
      </div>
      {showSwap && (
        <div style={{ marginTop: 16 }}>
          {alts.map((a) => (
            <button key={a.id} className="task" style={{ width: "100%", textAlign: "left" }} onClick={() => { actions.swapMeal(dateKey, slot, a.id); setShowSwap(false); }}>
              <MealTile meal={a} />
              <div className="tl"><div className="tt">{a.name}</div><div className="ts">{fmtNum(a.kcal)} kcal. {Math.round(a.p)} g protein. {a.noCook ? "No cooking" : `${a.prep} min`}</div></div>
              <ChevronRight size={18} />
            </button>
          ))}
          {item.swapped && <button className="lbl" style={{ marginTop: 10, textDecoration: "underline" }} onClick={() => { actions.swapMeal(dateKey, slot, null); setShowSwap(false); }}>Back to the planned meal</button>}
        </div>
      )}
    </Sheet>
  );
}

function GroceriesSheet({ onClose }) {
  const { state } = useApp();
  const t = todayKey();
  const list = useMemo(() => {
    const tot = {};
    for (let i = 0; i < 7; i++) {
      const nut = dayNutrition(state, addDays(t, i));
      nut.meals.forEach((m) => m.meal.ing.forEach(([fid, q]) => { tot[fid] = (tot[fid] || 0) + q; }));
    }
    return Object.entries(tot).sort((a, b) => FOODS[a[0]][0].localeCompare(FOODS[b[0]][0]));
  }, [state, t]);
  const fmt = (fid, q) => {
    const u = FOODS[fid][1];
    if (u === "g") return q >= 1000 ? `${(q / 1000).toFixed(1)} kg` : `${Math.round(q)} g`;
    if (u === "ml") return q >= 1000 ? `${(q / 1000).toFixed(1)} L` : `${Math.round(q)} ml`;
    return `${Math.ceil(q)}${u === "slice" ? " slices" : u === "tbsp" ? " tbsp" : ""}`;
  };
  return (
    <Sheet title="Groceries, 7 days" onClose={onClose}>
      <p className="mute" style={{ marginBottom: 12 }}>From {fmtShort(t)} to {fmtShort(addDays(t, 6))}, with your current portions and swaps.</p>
      <table className="tbl"><tbody>{list.map(([fid, q]) => <tr key={fid}><td>{FOODS[fid][0]}</td><td className="n" style={{ textAlign: "right", fontWeight: 700 }}>{fmt(fid, q)}</td></tr>)}</tbody></table>
    </Sheet>
  );
}

/* ---------- quick sheets ---------- */
function WeighSheet({ dateKey, onClose }) {
  const { state, actions } = useApp();
  const prev = Object.keys(state.weights).filter((k) => k < dateKey).sort().pop();
  const [v, setV] = useState(String(state.weights[dateKey] ?? (prev ? state.weights[prev] : state.profile.startWeight)));
  const n = Number(v);
  return (
    <Sheet title={dateKey === todayKey() ? "Morning weigh-in" : `Weight, ${fmtShort(dateKey)}`} onClose={onClose}>
      <p className="mute" style={{ marginBottom: 16 }}>Same conditions every day: after waking, before eating. The 7-day average is what matters.</p>
      <Stepper label="Body weight, kg" value={v} step={0.1} onChange={setV} />
      <button className="btn" style={{ marginTop: 16 }} disabled={!(n > 30 && n < 250)} onClick={() => { actions.setWeight(dateKey, +n.toFixed(1)); onClose(); }}>Save weight</button>
      {state.weights[dateKey] != null && <button className="lbl" style={{ marginTop: 16, width: "100%", textDecoration: "underline" }} onClick={() => { actions.setWeight(dateKey, null); onClose(); }}>Delete this entry</button>}
    </Sheet>
  );
}

function ActivitySheet({ dateKey, preset, onClose }) {
  const { actions } = useApp();
  const [type, setType] = useState(preset || "padel");
  const [duration, setDuration] = useState("90");
  const [intensity, setIntensity] = useState("medium");
  const d = Number(duration) || 0;
  const est = Math.round((d * ACT_TYPES[type].rate[intensity]) / 50) * 50;
  return (
    <Sheet title="Add activity" onClose={onClose}>
      <Field label="Activity"><Opt value={type} options={Object.entries(ACT_TYPES).map(([k, v]) => [k, v.label])} onChange={setType} /></Field>
      <div style={{ marginTop: 18 }}><Field label="Duration, minutes"><Opt value={duration} options={["60", "90", "120"]} onChange={setDuration} /></Field>
        <input style={{ marginTop: 8 }} inputMode="numeric" value={duration} onChange={(e) => setDuration(e.target.value)} aria-label="Custom duration" /></div>
      <div style={{ marginTop: 18 }}><Field label="Intensity"><Opt value={intensity} options={[["low", "Low"], ["medium", "Medium"], ["high", "High"]]} onChange={setIntensity} /></Field></div>
      <p className="lbl" style={{ marginTop: 16 }}>Adds about {fmtNum(est)} kcal to today's target{est >= 400 ? ", and flags a high activity day" : ""}. Rough estimate.</p>
      <button className="btn" style={{ marginTop: 16 }} disabled={d <= 0} onClick={() => { actions.addActivity({ date: dateKey, type, duration: d, intensity }); onClose(); }}>Save activity</button>
    </Sheet>
  );
}

function CheckinSheet({ dateKey, onClose }) {
  const { state, actions } = useApp();
  const c = state.days[dateKey]?.checkin;
  const [energy, setEnergy] = useState(c?.energy || "Good");
  const [note, setNote] = useState(c?.note || "");
  return (
    <Sheet title="Daily check-in" onClose={onClose}>
      <Field label="Energy today"><Opt value={energy} options={["Low", "Good", "High"]} onChange={setEnergy} /></Field>
      <div style={{ marginTop: 18 }}><Field label="One line about today (optional)"><textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Slept badly, crushed legs anyway." /></Field></div>
      <button className="btn" style={{ marginTop: 18 }} onClick={() => { actions.setCheckin(dateKey, { energy, note: note.trim() }); onClose(); }}>Save check-in</button>
    </Sheet>
  );
}

/* ---------- 7. PAGES: CALENDAR ---------- */
function CalendarPage() {
  const { state, metrics, open } = useApp();
  const [view, setView] = useState("month");
  const [cursor, setCursor] = useState(todayKey());
  const t = todayKey();
  const start = state.profile.startDate;
  const end = addDays(start, 364);

  const dayMeta = (k) => {
    const inf = dayInfo(state.profile, k);
    const sess = sessionOn(state, k);
    const padel = state.activities.some((a) => a.date === k && a.type === "padel");
    return { inf, sess, padel, rec: metrics.byKey[k], tag: !inf.inProgram ? "" : sess ? TEMPLATES[sess.tplId]?.short || "GYM" : inf.tplId ? TEMPLATES[inf.tplId].short : "REST" };
  };

  let body;
  if (view === "month") {
    const d = parseKey(cursor);
    const first = keyOf(new Date(d.getFullYear(), d.getMonth(), 1));
    const last = keyOf(new Date(d.getFullYear(), d.getMonth() + 1, 0));
    const from = weekStartOf(first);
    const to = addDays(weekStartOf(last), 6);
    const cells = [];
    for (let k = from; k <= to; k = addDays(k, 1)) {
      const { inf, padel, rec, tag, sess } = dayMeta(k);
      const out = k < first || k > last;
      cells.push(
        <button key={k} className={`c ${k === t ? "today" : ""} ${out ? "out" : ""}`} onClick={() => inf.inProgram && open("day", { key: k })} disabled={!inf.inProgram} style={{ opacity: !inf.inProgram && !out ? 0.35 : undefined }}>
          {rec && rec.pct > 0 && <span className="fill" style={{ height: `${rec.pct}%`, opacity: rec.pct === 100 ? 0.95 : 0.55 }} />}
          <span className="row between" style={{ gap: 2 }}><span className="dn n">{parseKey(k).getDate()}</span>{(padel || (inf.inProgram && inf.padelPlanned)) && <span style={{ width: 5, height: 5, borderRadius: 3, background: padel ? "var(--text)" : "var(--dim)" }} />}</span>
          <span className="tg" style={{ color: sess ? "var(--text)" : undefined }}>{tag}</span>
        </button>
      );
    }
    body = (
      <>
        <div className="between" style={{ marginBottom: 12 }}>
          <button className="ib" onClick={() => setCursor(keyOf(new Date(d.getFullYear(), d.getMonth() - 1, 1)))} aria-label="Previous month"><ChevronLeft size={20} /></button>
          <div className="h2 d">{MONTHS[d.getMonth()]} {d.getFullYear()}</div>
          <button className="ib" onClick={() => setCursor(keyOf(new Date(d.getFullYear(), d.getMonth() + 1, 1)))} aria-label="Next month"><ChevronRight size={20} /></button>
        </div>
        <div className="cal" style={{ marginBottom: 4 }}>{DOW3.map((x) => <div key={x} className="lbl" style={{ textAlign: "center", fontSize: 11 }}>{x}</div>)}</div>
        <div className="cal">{cells}</div>
        <div className="row" style={{ gap: 16, marginTop: 14, flexWrap: "wrap" }}>
          <span className="lbl row" style={{ gap: 6 }}><span style={{ width: 10, height: 10, background: "var(--red)" }} />Fill = day score</span>
          <span className="lbl row" style={{ gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: 3, background: "var(--text)" }} />Padel played</span>
          <span className="lbl row" style={{ gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: 3, background: "var(--dim)" }} />Padel planned</span>
        </div>
      </>
    );
  } else if (view === "week") {
    const ws = weekStartOf(cursor);
    body = (
      <>
        <div className="between" style={{ marginBottom: 12 }}>
          <button className="ib" onClick={() => setCursor(addDays(ws, -7))} aria-label="Previous week"><ChevronLeft size={20} /></button>
          <div className="h2 d">{fmtShort(ws)} to {fmtShort(addDays(ws, 6))}</div>
          <button className="ib" onClick={() => setCursor(addDays(ws, 7))} aria-label="Next week"><ChevronRight size={20} /></button>
        </div>
        {[...Array(7)].map((_, i) => {
          const k = addDays(ws, i);
          const { inf, padel, rec, sess } = dayMeta(k);
          const name = !inf.inProgram ? "Outside the program" : sess ? sess.name : inf.tplId ? TEMPLATES[inf.tplId].name : "Rest";
          return (
            <button key={k} className="task" style={{ width: "100%", textAlign: "left" }} disabled={!inf.inProgram} onClick={() => open("day", { key: k })}>
              <div style={{ width: 52 }}><div className="d" style={{ fontWeight: 800, color: k === t ? "var(--red)" : "var(--mute)" }}>{DOW3[i]}</div><div className="d n" style={{ fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{parseKey(k).getDate()}</div></div>
              <div className="tl">
                <div className="tt" style={{ textDecoration: "none" }}>{name}{(padel || inf.padelPlanned) && inf.inProgram && <span className={`chip ${padel ? "r" : ""}`} style={{ marginLeft: 8, height: 20 }}>Padel</span>}</div>
                {inf.inProgram && <div className="ts">Day {inf.dayNum}. {rec ? `${rec.done}/${rec.total} done` : k > t ? "Planned" : ""}</div>}
                {rec && <div style={{ marginTop: 6 }}><Bar v={rec.pct} max={100} /></div>}
              </div>
              <div className="d n" style={{ fontSize: 24, fontWeight: 800, width: 56, textAlign: "right" }}>{rec ? `${rec.pct}%` : ""}</div>
            </button>
          );
        })}
      </>
    );
  } else {
    const past = metrics.list.filter((r) => r.key < t);
    body = (
      <>
        <div className="grid3" style={{ marginBottom: 22 }}>
          <Stat v={metrics.list.filter((r) => r.pct >= LOCK).length} k="Days at 80%+" red />
          <Stat v={past.filter((r) => r.pct < 25).length} k="Missed days" />
          <Stat v={365 - metrics.list.length} k="Days to go" />
        </div>
        <Heatmap metrics={metrics} start={start} onPick={(k) => open("day", { key: k })} />
        <p className="lbl" style={{ marginTop: 12 }}>{fmtDate(start)} to {fmtDate(end)}. Each square is a day. Tap one to open it.</p>
      </>
    );
  }

  return (
    <div className="wrap">
      <div className="between" style={{ flexWrap: "wrap" }}>
        <div><div className="lbl">365 days</div><h1 className="h1 d" style={{ marginTop: 6 }}>Calendar</h1></div>
        <button className="chip" style={{ height: 34 }} onClick={() => { setCursor(t); open("day", { key: t }); }}>Open today</button>
      </div>
      <div style={{ marginTop: 18, maxWidth: 420 }}><Seg value={view} onChange={setView} options={[["week", "WEEK"], ["month", "MONTH"], ["year", "YEAR"]]} /></div>
      <div className="card" style={{ marginTop: 16, maxWidth: view === "year" ? undefined : 760 }}>{body}</div>
    </div>
  );
}

function DaySheet({ dateKey, onClose }) {
  const { state, actions, update } = useApp();
  const [k, setK] = useState(dateKey);
  const inf = dayInfo(state.profile, k);
  const nut = dayNutrition(state, k);
  const tasks = dayTasks(state, k, nut);
  const sc = scoreOf(tasks);
  const sess = sessionOn(state, k);
  const wk = buildWorkout(inf);
  const t = todayKey();
  const future = k > t;
  const note = state.days[k]?.note || "";
  return (
    <Sheet title={`Day ${pad(inf.dayNum, 3)}`} onClose={onClose}>
      <div className="between">
        <button className="ib" disabled={inf.idx <= 0} onClick={() => setK(addDays(k, -1))} aria-label="Previous day"><ChevronLeft size={20} /></button>
        <div style={{ textAlign: "center" }}><div className="h3 d">{fmtDate(k)}</div><div className="lbl">Phase {inf.phase.id}: {inf.phase.name}. Week {inf.week}</div></div>
        <button className="ib" disabled={inf.idx >= 364} onClick={() => setK(addDays(k, 1))} aria-label="Next day"><ChevronRight size={20} /></button>
      </div>
      {!inf.inProgram ? <p className="mute" style={{ marginTop: 20 }}>This day is outside the 365-day program.</p> : <>
        <div className="row" style={{ marginTop: 18, gap: 18 }}>
          <Ring pct={future ? 0 : sc.pct} size={92} stroke={6}><div className="d n" style={{ fontSize: 28, fontWeight: 900 }}>{future ? "–" : `${sc.pct}%`}</div></Ring>
          <div><div className="d n" style={{ fontSize: 26, fontWeight: 800 }}>{future ? "Planned" : `${sc.done} / ${sc.total}`}</div><div className="lbl">Completion score</div></div>
        </div>

        <div className="sec" style={{ marginTop: 22 }}>
          <h3 className="h3 d" style={{ marginBottom: 6 }}>Workout</h3>
          {sess ? <p>{sess.name}: {sess.sets} sets, {fmtNum(sess.volume)} kg, {fmtDur(sess.endedAt - sess.startedAt)}{sess.prs ? `, ${sess.prs} PR` : ""}.</p>
            : wk ? <>{wk.exercises.map((x) => <div key={x.exId} className="between" style={{ padding: "7px 0", borderBottom: "1px solid var(--line)" }}><span style={{ fontSize: 14 }}>{x.name}</span><span className="d n" style={{ fontWeight: 800 }}>{x.sets} × {x.reps[0]}-{x.reps[1]}</span></div>)}
              {k === t && <button className="btn sm" style={{ marginTop: 12, width: "100%" }} onClick={() => { onClose(); actions.goWorkout(k); }}><Play size={16} fill="#fff" />Start workout</button>}</>
            : <p className="mute">Rest day.{inf.padelPlanned ? " Padel planned." : ""}</p>}
        </div>

        <div className="sec" style={{ marginTop: 22 }}>
          <h3 className="h3 d" style={{ marginBottom: 6 }}>Nutrition</h3>
          <p className="lbl" style={{ marginBottom: 6 }}>{fmtNum(nut.consumed.kcal)} / {fmtNum(nut.target.kcal)} kcal. {Math.round(nut.consumed.p)} / {nut.target.p} g protein</p>
          {nut.meals.map((m) => <div key={m.slot} className="between" style={{ padding: "7px 0", borderBottom: "1px solid var(--line)" }}><span style={{ fontSize: 14 }}><span className="mute">{SLOT_LABEL[m.slot]}.</span> {m.meal.name}</span><span className="d n" style={{ fontWeight: 800, color: m.eaten ? "var(--red)" : undefined }}>{m.eaten ? "Eaten" : `${fmtNum(m.meal.kcal)}`}</span></div>)}
        </div>

        <div className="sec" style={{ marginTop: 22 }}>
          <h3 className="h3 d" style={{ marginBottom: 2 }}>Habits</h3>
          {future ? <p className="mute">Opens on the day.</p> : <Checklist tasks={tasks} dateKey={k} />}
        </div>

        <div className="sec" style={{ marginTop: 22 }}>
          <h3 className="h3 d" style={{ marginBottom: 8 }}>Notes</h3>
          <textarea rows={3} value={note} placeholder="How did it go?" onChange={(e) => { const v = e.target.value; update((d) => { (d.days[k] = d.days[k] || {}).note = v; }); }} />
        </div>
      </>}
    </Sheet>
  );
}

function ReviewSheet({ ws, onClose }) {
  const { state, metrics, actions } = useApp();
  const st = weekStats(state, metrics, ws);
  const saved = state.checkins[ws];
  const [editing, setEditing] = useState(!saved);
  const [f, setF] = useState(saved?.answers || { hunger: "Good", energy: "Good", recovery: "Good", workouts: "Yes", notes: "" });
  const sug = weeklySuggestion(st);
  const set = (k) => (v) => setF({ ...f, [k]: v });
  return (
    <Sheet title="Weekly review" onClose={onClose}>
      <div className="lbl">Week of {fmtShort(ws)}. Week {dayInfo(state.profile, ws).week} of 52</div>
      <div className="grid2" style={{ marginTop: 16, rowGap: 22 }}>
        <Stat v={st.wAvg != null ? st.wAvg.toFixed(1) : "–"} unit="kg" k="Average weight" />
        <Stat v={st.change != null ? fmtKg(st.change, true) : "–"} unit="kg" k="Change vs last week" red={st.change > 0} />
        <Stat v={`${st.kcalAdh}%`} k="Calorie days hit" />
        <Stat v={`${st.pAdh}%`} k="Protein days hit" />
        <Stat v={`${st.gym}/${st.planned}`} k="Gym sessions" />
        <Stat v={st.padel} k="Padel sessions" />
        <Stat v={`${st.avgScore}%`} k="Average daily score" red />
      </div>
      {editing ? <>
        <div style={{ display: "grid", gap: 18, marginTop: 26 }}>
          <Field label="How was your hunger?"><Opt value={f.hunger} options={["Low", "Good", "High"]} onChange={set("hunger")} /></Field>
          <Field label="How was your energy?"><Opt value={f.energy} options={["Low", "Good", "High"]} onChange={set("energy")} /></Field>
          <Field label="How was your recovery?"><Opt value={f.recovery} options={["Poor", "Good", "Excellent"]} onChange={set("recovery")} /></Field>
          <Field label="Did you complete your workouts?"><Opt value={f.workouts} options={["Yes", "Mostly", "No"]} onChange={set("workouts")} /></Field>
          <Field label="Notes"><textarea rows={3} value={f.notes} onChange={(e) => set("notes")(e.target.value)} placeholder="What worked, what didn't." /></Field>
        </div>
        <button className="btn" style={{ marginTop: 20 }} onClick={() => { actions.submitReview(ws, { answers: f, stats: st, suggestion: sug.text }); setEditing(false); }}>Submit week</button>
      </> : <>
        <div className="card" style={{ marginTop: 24, borderColor: "rgba(232,41,28,.4)" }}>
          <div className="lbl">Synthesis</div>
          <p style={{ marginTop: 8, fontSize: 16, fontWeight: 600 }}>{sug.text}</p>
          {f.hunger === "Low" && st.kcalAdh < 70 && <p className="mute" style={{ marginTop: 8, fontSize: 14 }}>Low hunger: lean on the no-cook meals and drink part of your calories (milk). Turn on "Prefer no-cook meals" in Profile.</p>}
          {f.recovery === "Poor" && <p className="mute" style={{ marginTop: 8, fontSize: 14 }}>Poor recovery: protect sleep and keep padel intensity medium before leg days.</p>}
          {sug.delta !== 0 && (saved?.applied
            ? <p className="lbl" style={{ marginTop: 12 }}>Applied: {sug.delta > 0 ? "+" : ""}{sug.delta} kcal a day.</p>
            : <button className="btn sm" style={{ marginTop: 14, width: "100%" }} onClick={() => actions.applyAdjust(ws, sug.delta)}>Apply {sug.delta > 0 ? "+" : ""}{sug.delta} kcal a day</button>)}
        </div>
        <p className="mute" style={{ marginTop: 14, fontSize: 14 }}>Hunger {f.hunger.toLowerCase()}. Energy {f.energy.toLowerCase()}. Recovery {f.recovery.toLowerCase()}. Workouts: {f.workouts.toLowerCase()}.{f.notes ? ` ${f.notes}` : ""}</p>
        <button className="btn ghost sm" style={{ marginTop: 16, width: "100%" }} onClick={() => setEditing(true)}>Edit answers</button>
      </>}
    </Sheet>
  );
}

/* ---------- 7. PAGES: PROGRESS ---------- */
const photoCache = new Map();
function usePhoto(id) {
  const [src, setSrc] = useState(photoCache.get(id) || null);
  useEffect(() => {
    let live = true;
    if (!id) { setSrc(null); return; }
    if (photoCache.has(id)) { setSrc(photoCache.get(id)); return; }
    storage.get(PHOTO_KEY(id)).then((v) => { if (v) photoCache.set(id, v); if (live) setSrc(v); });
    return () => { live = false; };
  }, [id]);
  return src;
}
function PhotoImg({ id, style }) {
  const src = usePhoto(id);
  return src ? <img src={src} alt="" style={style} /> : <div style={{ ...style, background: "var(--s2)" }} />;
}
function compressImage(file, max = 1000, q = 0.82) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL("image/jpeg", q));
      };
      img.onerror = rej; img.src = r.result;
    };
    r.onerror = rej; r.readAsDataURL(file);
  });
}

function WeightChart({ state }) {
  const [range, setRange] = useState("90");
  const keys = Object.keys(state.weights).sort();
  if (!keys.length) return <p className="mute">Log your first weigh-in to start the curve.</p>;
  const t = todayKey();
  const from = range === "all" ? keys[0] : [keys[0], addDays(t, -Number(range) + 1)].sort()[1];
  const data = [];
  for (let k = from; k <= t; k = addDays(k, 1)) {
    const a = avg7At(state.weights, k);
    data.push({ d: fmtShort(k), w: state.weights[k] ?? null, a: a != null ? +a.toFixed(2) : null });
  }
  return (
    <div>
      <div style={{ maxWidth: 300, marginBottom: 12 }}><Seg value={range} onChange={setRange} options={[["30", "30D"], ["90", "90D"], ["all", "ALL"]]} /></div>
      <div style={{ height: 240, marginLeft: -18 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="#1a1a1a" vertical={false} />
            <XAxis dataKey="d" tick={{ fill: "#5a5853", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#222" }} minTickGap={28} />
            <YAxis domain={["dataMin - 0.8", "dataMax + 0.8"]} tick={{ fill: "#5a5853", fontSize: 11 }} tickLine={false} axisLine={false} width={44} tickFormatter={(v) => v.toFixed(1)} />
            <Tooltip contentStyle={{ background: "#151515", border: "1px solid #2c2c2c", borderRadius: 3, fontSize: 13 }} labelStyle={{ color: "#8d8a84" }} formatter={(v, n) => [`${Number(v).toFixed(1)} kg`, n === "a" ? "7-day avg" : "Daily"]} />
            <Scatter dataKey="w" fill="#5a5853" />
            <Line dataKey="a" stroke="#e8291c" strokeWidth={2.5} dot={false} connectNulls isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="row" style={{ gap: 16, marginTop: 8 }}>
        <span className="lbl row" style={{ gap: 6 }}><span style={{ width: 7, height: 7, borderRadius: 4, background: "#5a5853" }} />Daily weight</span>
        <span className="lbl row" style={{ gap: 6 }}><span style={{ width: 14, height: 2.5, background: "var(--red)" }} />7-day average</span>
      </div>
    </div>
  );
}

function OverviewTab() {
  const { state, metrics, open } = useApp();
  const t = todayKey();
  const p = state.profile;
  const reviews = Object.keys(state.checkins).sort().reverse();
  const toGoal = p.goalWeight - p.startWeight;
  return (
    <div className="two">
      <div>
        <div className="grid4">
          <Stat v={p.startWeight.toFixed(1)} unit="kg" k="Starting weight" />
          <Stat v={metrics.hasWeights ? metrics.currentW.toFixed(1) : "–"} unit="kg" k="Current, 7-day avg" />
          <Stat v={p.goalWeight.toFixed(1)} unit="kg" k="Goal" />
          <Stat v={metrics.hasWeights ? fmtKg(metrics.gain, true) : "–"} unit="kg" k="Gained" red />
        </div>
        {metrics.hasWeights && toGoal > 0 && <div style={{ marginTop: 16 }}><Bar v={Math.max(0, metrics.gain)} max={toGoal} /><div className="lbl" style={{ marginTop: 6 }}>{Math.round(clamp(metrics.gain / toGoal, 0, 1) * 100)}% of the weight goal</div></div>}
        <div className="card" style={{ marginTop: 20 }}>
          <div className="between" style={{ marginBottom: 14 }}><h2 className="h3 d">Body weight</h2><button className="btn xs" onClick={() => open("weigh", { key: t })}><Plus size={15} />Log weight</button></div>
          <WeightChart state={state} />
        </div>
        <div className="sec">
          <SecH title="Weekly reviews" right={<button className="chip" onClick={() => open("review", { ws: weekStartOf(t) })}>This week</button>} />
          {reviews.length ? reviews.map((ws) => {
            const r = state.checkins[ws];
            return (
              <button key={ws} className="task" style={{ width: "100%", textAlign: "left" }} onClick={() => open("review", { ws })}>
                <div className="tl"><div className="tt">Week of {fmtShort(ws)}</div><div className="ts">{r.suggestion}</div></div>
                <div className="d n" style={{ fontSize: 22, fontWeight: 800 }}>{r.stats.avgScore}%</div>
              </button>
            );
          }) : <p className="mute">Your first review opens on Sunday.</p>}
        </div>
      </div>
      <div>
        <div className="card">
          <h2 className="h3 d" style={{ marginBottom: 18 }}>Consistency</h2>
          <div className="grid2" style={{ rowGap: 22 }}>
            <Stat v={`${metrics.today.pct}%`} k={`Today, ${metrics.today.done}/${metrics.today.total}`} />
            <Stat v={`${metrics.week.pct}%`} k={`This week, ${metrics.week.done}/${metrics.week.total}`} />
            <Stat v={`${metrics.month.pct}%`} k="This month" />
            <Stat v={`${metrics.discipline}%`} k="Discipline score" red />
            <Stat v={metrics.cur} unit="days" k="Current streak" />
            <Stat v={metrics.best} unit="days" k="Best streak" />
            <Stat v={metrics.workoutAdh != null ? `${metrics.workoutAdh}%` : "–"} k="Workout adherence" />
            <Stat v={metrics.nutritionAdh != null ? `${metrics.nutritionAdh}%` : "–"} k="Nutrition adherence" />
          </div>
          <p className="lbl" style={{ marginTop: 16 }}>A day counts toward the streak at {LOCK}% or more.</p>
        </div>
        <div className="card" style={{ marginTop: 14 }}>
          <h2 className="h3 d" style={{ marginBottom: 14 }}>365</h2>
          <Heatmap metrics={metrics} start={p.startDate} compact onPick={(k) => open("day", { key: k })} />
        </div>
      </div>
    </div>
  );
}

const MEAS = [["chest", "Chest"], ["waist", "Waist"], ["arms", "Arms"], ["thighs", "Thighs"], ["shoulders", "Shoulders"]];
function BodyTab() {
  const { state, actions } = useApp();
  const [f, setF] = useState({});
  const list = [...state.measurements].sort((a, b) => a.date.localeCompare(b.date));
  const first = list[0];
  const ok = MEAS.some(([k]) => Number(f[k]) > 0);
  return (
    <div className="two">
      <div className="card">
        <h2 className="h3 d">Log measurements</h2>
        <p className="lbl" style={{ marginTop: 4 }}>Every 2 to 4 weeks, in cm, same tape, same time of day. Arms flexed, waist at the navel.</p>
        <div className="grid2" style={{ marginTop: 16 }}>
          {MEAS.map(([k, l]) => <Field key={k} label={l}><input inputMode="decimal" value={f[k] || ""} onChange={(e) => setF({ ...f, [k]: e.target.value.replace(",", ".") })} placeholder="cm" /></Field>)}
        </div>
        <button className="btn" style={{ marginTop: 16 }} disabled={!ok} onClick={() => {
          const m = { date: todayKey() }; MEAS.forEach(([k]) => { if (Number(f[k]) > 0) m[k] = Number(f[k]); });
          actions.addMeasurement(m); setF({});
        }}>Save measurements</button>
      </div>
      <div>
        <SecH title="History" />
        {list.length ? <div className="scroll-x"><table className="tbl n">
          <thead><tr><th>Date</th>{MEAS.map(([k, l]) => <th key={k}>{l}</th>)}<th /></tr></thead>
          <tbody>{[...list].reverse().map((m) => (
            <tr key={m.id}><td style={{ whiteSpace: "nowrap" }}>{fmtShort(m.date)}</td>
              {MEAS.map(([k]) => <td key={k}>{m[k] ?? "–"}{m[k] && first[k] && m.id !== first.id && <div className={m[k] - first[k] >= 0 ? "red" : "mute"} style={{ fontSize: 11 }}>{m[k] - first[k] >= 0 ? "+" : ""}{(m[k] - first[k]).toFixed(1)}</div>}</td>)}
              <td><button className="ib" style={{ width: 32, height: 32 }} onClick={() => actions.removeMeasurement(m.id)} aria-label="Delete"><Trash2 size={15} /></button></td></tr>
          ))}</tbody>
        </table></div> : <p className="mute">No measurements yet. Take your baseline this week.</p>}
      </div>
    </div>
  );
}

function PhotosTab() {
  const { state, actions } = useApp();
  const [pose, setPose] = useState("front");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  const list = state.photos.filter((p) => p.pose === pose).sort((a, b) => a.date.localeCompare(b.date));
  const [aId, setA] = useState(null);
  const [bId, setB] = useState(null);
  const [pos, setPos] = useState(50);
  const A = list.find((p) => p.id === aId) || list[0];
  const B = list.find((p) => p.id === bId) || list[list.length - 1];
  const dayN = (k) => diffDays(state.profile.startDate, k) + 1;
  const onFile = async (e) => {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return;
    setBusy(true);
    try { await actions.addPhoto(pose, await compressImage(file)); } finally { setBusy(false); }
  };
  return (
    <div>
      <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240, maxWidth: 380 }}><Seg value={pose} onChange={(v) => { setPose(v); setA(null); setB(null); }} options={[["front", "FRONT"], ["side", "SIDE"], ["back", "BACK"]]} /></div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onFile} />
        <button className="btn sm" onClick={() => fileRef.current?.click()} disabled={busy}><Camera size={17} />{busy ? "Saving" : `Add ${pose} photo`}</button>
      </div>
      {list.length >= 2 && A && B && (
        <div className="two" style={{ marginTop: 22 }}>
          <div>
            <div className="cmp" onPointerMove={(e) => { if (e.buttons !== 1) return; const r = e.currentTarget.getBoundingClientRect(); setPos(clamp(((e.clientX - r.left) / r.width) * 100, 0, 100)); }}>
              <PhotoImg id={B.id} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${100 - pos}% 0 0)` }}><PhotoImg id={A.id} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} /></div>
              <div className="ln" style={{ left: `calc(${pos}% - 1px)` }} />
              <span className="chip" style={{ position: "absolute", left: 10, top: 10, background: "rgba(0,0,0,.7)", color: "#fff" }}>DAY {dayN(A.date)}</span>
              <span className="chip r" style={{ position: "absolute", right: 10, top: 10, background: "var(--red)", color: "#fff" }}>DAY {dayN(B.date)}</span>
            </div>
            <input type="range" min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))} style={{ marginTop: 12, padding: 0, accentColor: "#e8291c", background: "transparent", border: 0 }} aria-label="Before and after slider" />
          </div>
          <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
            <Field label="Before"><select value={A.id} onChange={(e) => setA(e.target.value)}>{list.map((p) => <option key={p.id} value={p.id}>Day {dayN(p.date)}, {fmtShort(p.date)}</option>)}</select></Field>
            <Field label="After"><select value={B.id} onChange={(e) => setB(e.target.value)}>{list.map((p) => <option key={p.id} value={p.id}>Day {dayN(p.date)}, {fmtShort(p.date)}</option>)}</select></Field>
            <p className="lbl">Drag across the photo or use the slider. Same light, same spot, same time of day for honest comparisons.</p>
          </div>
        </div>
      )}
      <div className="sec">
        <SecH title={`${pose} timeline`} />
        {list.length ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 8 }}>
          {[...list].reverse().map((p) => (
            <div key={p.id} style={{ position: "relative" }}>
              <PhotoImg id={p.id} style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", borderRadius: 3, display: "block" }} />
              <div className="between" style={{ marginTop: 6 }}><span className="lbl">Day {dayN(p.date)}. {fmtShort(p.date)}</span>
                <button className="ib" style={{ width: 30, height: 30 }} onClick={() => actions.deletePhoto(p.id)} aria-label="Delete photo"><Trash2 size={14} /></button></div>
            </div>
          ))}
        </div> : <p className="mute">No {pose} photo yet. Take day 1 now, you will want it in October.</p>}
      </div>
    </div>
  );
}

function AwardsTab() {
  const { state, metrics } = useApp();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10 }}>
      {ACH.map((a) => {
        const on = a.test(state, metrics);
        return (
          <div key={a.id} className={`badge ${on ? "" : "lock"}`}>
            <div className="bi">{on ? <Trophy size={15} color="var(--red)" /> : <Lock size={14} color="var(--dim)" />}</div>
            <div><div className="d up" style={{ fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{a.name}</div><div className="lbl" style={{ marginTop: 4 }}>{a.desc}</div></div>
          </div>
        );
      })}
    </div>
  );
}

function ProgressPage() {
  const [tab, setTab] = useState("overview");
  return (
    <div className="wrap">
      <div className="lbl">Is it working?</div>
      <h1 className="h1 d" style={{ marginTop: 6 }}>Progress</h1>
      <div style={{ marginTop: 18, maxWidth: 520 }}><Seg value={tab} onChange={setTab} options={[["overview", "OVERVIEW"], ["body", "BODY"], ["photos", "PHOTOS"], ["awards", "AWARDS"]]} /></div>
      <div style={{ marginTop: 22 }}>
        {tab === "overview" && <OverviewTab />}
        {tab === "body" && <BodyTab />}
        {tab === "photos" && <PhotosTab />}
        {tab === "awards" && <AwardsTab />}
      </div>
    </div>
  );
}

/* ---------- 7. PAGES: PROFILE ---------- */
function ProfilePage() {
  const { state, metrics, actions, toast } = useApp();
  const [p, setP] = useState(state.profile);
  const [io, setIo] = useState("");
  const [confirmReset, setConfirmReset] = useState(0);
  useEffect(() => setP(state.profile), [state.profile]);
  const dirty = JSON.stringify(p) !== JSON.stringify(state.profile);
  const set = (k, v) => setP({ ...p, [k]: v });
  const num = (k) => (e) => set(k, e.target.value === "" ? "" : Number(e.target.value.replace(",", ".")));
  const preview = baseTargets({ ...p, manual: { ...p.manual } }, weightAt(state, todayKey()));
  const end = addDays(state.profile.startDate, 364);
  const valid = p.name && p.age > 0 && p.heightCm > 100 && p.startWeight > 30 && p.goalWeight > 30 && /^\d{4}-\d{2}-\d{2}$/.test(p.startDate);
  return (
    <div className="wrap">
      <div className="lbl">{state.profile.name}</div>
      <h1 className="h1 d" style={{ marginTop: 6 }}>Profile</h1>
      <div className="two" style={{ marginTop: 22 }}>
        <div>
          <div className="card" style={{ padding: 22 }}>
            <div className="lbl">12-month mission</div>
            <div className="d up" style={{ fontSize: 46, fontWeight: 900, lineHeight: 0.9, marginTop: 8 }}>Massive<br />and aesthetic</div>
            <div className="grid2" style={{ marginTop: 22, rowGap: 20 }}>
              <Stat v={state.profile.startWeight.toFixed(1)} unit="kg" k="Starting weight" />
              <Stat v={state.profile.goalWeight.toFixed(1)} unit="kg" k="Goal weight" />
              <Stat v={`${metrics.list.length}/365`} k="Days completed" red />
              <Stat v={metrics.list.filter((r) => r.pct >= LOCK).length} k="Days at 80%+" />
            </div>
            <p className="lbl" style={{ marginTop: 18 }}>{fmtDate(state.profile.startDate)} to {fmtDate(end)}</p>
          </div>

          <div className="sec">
            <SecH title="Body & mission" />
            <div className="grid2">
              <Field label="Name"><input value={p.name} onChange={(e) => set("name", e.target.value)} /></Field>
              <Field label="Age"><input inputMode="numeric" value={p.age} onChange={num("age")} /></Field>
              <Field label="Height, cm"><input inputMode="numeric" value={p.heightCm} onChange={num("heightCm")} /></Field>
              <Field label="Starting weight, kg"><input inputMode="decimal" value={p.startWeight} onChange={num("startWeight")} /></Field>
              <Field label="Goal weight, kg"><input inputMode="decimal" value={p.goalWeight} onChange={num("goalWeight")} /></Field>
              <Field label="Day 1"><input type="date" value={p.startDate} onChange={(e) => set("startDate", e.target.value)} /></Field>
            </div>
          </div>

          <div className="sec">
            <SecH title="Training" />
            <Field label="Gym sessions per week"><Opt value={String(p.sessionsPerWeek)} options={[["auto", "Auto (4 then 5)"], ["4", "4"], ["5", "5"]]} onChange={(v) => set("sessionsPerWeek", v === "auto" ? "auto" : Number(v))} /></Field>
            <div style={{ marginTop: 16 }}><Field label="Usual padel days">
              <div className="opt">{DOW3.map((d, i) => <button key={d} className={p.padelDays.includes(i) ? "on" : ""} style={{ padding: "0 12px" }} onClick={() => set("padelDays", p.padelDays.includes(i) ? p.padelDays.filter((x) => x !== i) : [...p.padelDays, i].sort())}>{d}</button>)}</div>
            </Field></div>
          </div>
        </div>

        <div>
          <SecH title="Nutrition targets" />
          <Field label="Mode"><Opt value={p.nutritionMode} options={[["auto", "Auto from body weight"], ["manual", "Manual"]]} onChange={(v) => set("nutritionMode", v)} /></Field>
          {p.nutritionMode === "auto" ? <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
            <Field label="Daily life outside training"><Opt value={p.activity} options={[[1.35, "Mostly seated"], [1.45, "Moderate"], [1.55, "On my feet"]]} onChange={(v) => set("activity", v)} /></Field>
            <Field label="Surplus"><Opt value={p.surplus} options={[[250, "+250 lean"], [350, "+350 standard"], [500, "+500 hard gainer"]]} onChange={(v) => set("surplus", v)} /></Field>
            <Field label="Protein per kg"><Opt value={p.proteinPerKg} options={[[1.8, "1.8 g"], [2, "2.0 g"], [2.2, "2.2 g"]]} onChange={(v) => set("proteinPerKg", v)} /></Field>
            <Field label="Manual adjustment, kcal a day"><input inputMode="numeric" value={p.kcalAdjust} onChange={num("kcalAdjust")} /></Field>
          </div> : <div className="grid2" style={{ marginTop: 16 }}>
            {[["kcal", "Calories"], ["protein", "Protein, g"], ["carbs", "Carbs, g"], ["fat", "Fat, g"]].map(([k, l]) => (
              <Field key={k} label={l}><input inputMode="numeric" value={p.manual[k]} onChange={(e) => setP({ ...p, manual: { ...p.manual, [k]: Number(e.target.value) || 0 } })} /></Field>
            ))}
          </div>}
          <div className="card" style={{ marginTop: 16 }}>
            <div className="lbl">Base target on a day without padel</div>
            <div className="row" style={{ gap: 20, marginTop: 10, flexWrap: "wrap" }}>
              <Stat v={fmtNum(preview.kcal)} k="kcal" red /><Stat v={preview.p} unit="g" k="Protein" /><Stat v={preview.c} unit="g" k="Carbs" /><Stat v={preview.f} unit="g" k="Fat" />
            </div>
            <p className="lbl" style={{ marginTop: 12 }}>Auto mode recalculates from your 7-day average weight. Logged activities add on top. These are tracking estimates, not medical prescriptions.</p>
          </div>

          <div className="sec">
            <SecH title="Habits & food" />
            <div style={{ display: "grid", gap: 16 }}>
              <Field label="Water target, litres"><Opt value={p.waterL} options={[2.5, 3, 3.5, 4]} onChange={(v) => set("waterL", v)} /></Field>
              <Field label="Daily creatine reminder"><Opt value={p.creatine} options={[[true, "On"], [false, "Off"]]} onChange={(v) => set("creatine", v)} /></Field>
              <Field label="Food preferences">
                <div className="opt">{[["noCook", "Prefer no-cook meals"], ["noFish", "No fish"], ["noPork", "No pork"]].map(([k, l]) => (
                  <button key={k} className={p.prefs[k] ? "on" : ""} onClick={() => setP({ ...p, prefs: { ...p.prefs, [k]: !p.prefs[k] } })}>{l}</button>
                ))}</div>
              </Field>
            </div>
          </div>

          <div style={{ position: "sticky", bottom: 96, marginTop: 24, zIndex: 5 }}>
            <button className="btn" disabled={!dirty || !valid} onClick={() => { actions.updateProfile(p); toast("Profile saved"); }}>{dirty ? "Save changes" : "Saved"}</button>
          </div>

          <div className="sec">
            <SecH title="Data" />
            <p className="lbl" style={{ marginBottom: 10 }}>Everything is saved automatically on this account. Backups exclude photos.</p>
            <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
              <button className="btn xs ghost" onClick={() => { const { photos, ...rest } = state; setIo(JSON.stringify({ ...rest, photos: [] })); }}>Show backup</button>
              <button className="btn xs ghost" disabled={!io} onClick={() => { try { navigator.clipboard.writeText(io); toast("Backup copied"); } catch { toast("Select the text and copy it"); } }}>Copy</button>
              <button className="btn xs ghost" disabled={!io} onClick={() => { try { actions.importState(JSON.parse(io)); toast("Backup restored"); setIo(""); } catch { toast("That backup is not valid JSON", "err"); } }}>Restore from text</button>
            </div>
            <textarea rows={4} style={{ marginTop: 10, fontSize: 12 }} value={io} onChange={(e) => setIo(e.target.value)} placeholder="Paste a backup here to restore it." />
            <button className="lbl" style={{ marginTop: 16, textDecoration: "underline", color: confirmReset ? "var(--red)" : undefined }}
              onClick={() => { if (confirmReset) { actions.resetAll(); setConfirmReset(0); } else { setConfirmReset(1); setTimeout(() => setConfirmReset(0), 4000); } }}>
              {confirmReset ? "Tap again to erase everything" : "Reset all data"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- 9. SHELL ---------- */
const TABS = [
  ["today", "TODAY", Crosshair], ["calendar", "CALENDAR", CalendarDays], ["training", "TRAINING", Dumbbell],
  ["nutrition", "NUTRITION", UtensilsCrossed], ["progress", "PROGRESS", LineIcon], ["profile", "PROFILE", User],
];

function Splash({ ready, onEnter }) {
  return (
    <div className="splash mp" onClick={() => ready && onEnter()}>
      <div className="d up s1">Elie</div>
      <div className="d up s2">Mass protocol</div>
      <div style={{ marginTop: 40, color: "var(--mute)", fontSize: 16, lineHeight: 1.6 }}>365 days.<br />One mission.</div>
      <button className="btn" style={{ marginTop: 40, maxWidth: 320, opacity: ready ? 1 : 0.4 }} onClick={(e) => { e.stopPropagation(); ready && onEnter(); }}>{ready ? "Enter" : "Loading"}</button>
    </div>
  );
}

function DayComplete({ dayNum, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4200); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="complete mp" onClick={onClose}>
      <div className="d up" style={{ fontSize: 30, fontWeight: 900, letterSpacing: ".08em" }}>Day complete.</div>
      <div className="d big n">100%</div>
      <div className="d up" style={{ fontSize: 24, fontWeight: 800, color: "var(--mute)", marginTop: 18, lineHeight: 1.15 }}>Day {dayNum} is done.<br />{365 - dayNum} to go.</div>
    </div>
  );
}

export default function App() {
  const [state, setState] = useState(null);
  const [entered, setEntered] = useState(false);
  const [tab, setTab] = useState("today");
  const [sheet, setSheet] = useState(null);
  const [wmOpen, setWmOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [celebrate, setCelebrate] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const stateRef = useRef(null);
  const saveTimer = useRef(null);
  const toastTimer = useRef(null);
  const prevPct = useRef(null);
  stateRef.current = state;

  // load
  useEffect(() => {
    (async () => {
      const raw = await storage.get(STORE_KEY);
      let s = null;
      if (raw) { try { s = migrate(JSON.parse(raw)); } catch { s = null; } }
      setState(s || defaultState());
    })();
  }, []);
  // persist (debounced)
  useEffect(() => {
    if (!state) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { storage.set(STORE_KEY, JSON.stringify(state)); }, 350);
  }, [state]);

  const update = useCallback((fn) => setState((s) => { const d = structuredClone(s); fn(d); return d; }), []);
  const toast = useCallback((msg, kind) => {
    clearTimeout(toastTimer.current);
    setToastMsg({ msg, kind });
    toastTimer.current = setTimeout(() => setToastMsg(null), 2400);
  }, []);
  const open = useCallback((type, params) => setSheet({ type, ...params }), []);
  const close = useCallback(() => setSheet(null), []);

  const metrics = useMemo(() => (state ? computeMetrics(state) : null), [state]);

  // day-complete moment + achievement unlocks
  useEffect(() => {
    if (!state || !metrics) return;
    const pct = metrics.today.pct;
    if (prevPct.current != null && prevPct.current < 100 && pct === 100) setCelebrate(dayInfo(state.profile, todayKey()).dayNum);
    prevPct.current = pct;
    const unlocked = ACH.filter((a) => a.test(state, metrics)).map((a) => a.id);
    const fresh = unlocked.filter((id) => !state.seenAch.includes(id));
    if (fresh.length) {
      const a = ACH.find((x) => x.id === fresh[0]);
      setTimeout(() => toast(`Unlocked: ${a.name}`, "ach"), 600);
      update((d) => { d.seenAch = [...new Set([...d.seenAch, ...fresh])]; });
    }
  }, [metrics]); // eslint-disable-line react-hooks/exhaustive-deps

  const actions = useMemo(() => {
    const day = (d, k) => (d.days[k] = d.days[k] || {});
    const A = {
      toggleMeal: (k, slot) => update((d) => { const dd = day(d, k); dd.meals = dd.meals || {}; const m = (dd.meals[slot] = dd.meals[slot] || {}); m.eaten = !m.eaten; }),
      swapMeal: (k, slot, id) => update((d) => { const dd = day(d, k); dd.meals = dd.meals || {}; const m = (dd.meals[slot] = dd.meals[slot] || {}); if (id) m.swap = id; else delete m.swap; }),
      toggleHabit: (k, id) => update((d) => { const dd = day(d, k); dd.habits = dd.habits || {}; dd.habits[id] = !dd.habits[id]; }),
      overrideAuto: (k, t) => update((d) => { const dd = day(d, k); dd.habits = dd.habits || {}; const v = !t.done; if (v === t.auto) delete dd.habits[t.id]; else dd.habits[t.id] = v; }),
      setWeight: (k, w) => update((d) => { if (w == null) delete d.weights[k]; else d.weights[k] = w; }),
      setCheckin: (k, c) => update((d) => { day(d, k).checkin = c; }),
      addExtra: (k, x) => update((d) => { const dd = day(d, k); dd.extras = [...(dd.extras || []), { id: uid(), ...x }]; }),
      removeExtra: (k, id) => update((d) => { const dd = day(d, k); dd.extras = (dd.extras || []).filter((x) => x.id !== id); }),
      addActivity: (a) => { update((d) => { d.activities.push({ id: uid(), ...a }); }); toast(`${ACT_TYPES[a.type].label} logged`); },
      removeActivity: (id) => update((d) => { d.activities = d.activities.filter((a) => a.id !== id); }),
      addMeasurement: (m) => { update((d) => { d.measurements.push({ id: uid(), ...m }); }); toast("Measurements saved"); },
      removeMeasurement: (id) => update((d) => { d.measurements = d.measurements.filter((m) => m.id !== id); }),
      updateProfile: (p) => update((d) => { d.profile = { ...d.profile, ...p }; }),
      submitReview: (ws, r) => { update((d) => { d.checkins[ws] = { ...(d.checkins[ws] || {}), ...r, submittedAt: Date.now() }; }); toast("Week submitted"); },
      applyAdjust: (ws, delta) => {
        update((d) => {
          if (d.profile.nutritionMode === "manual") { d.profile.manual.kcal += delta; d.profile.manual.carbs += Math.round(delta / 4); }
          else d.profile.kcalAdjust += delta;
          d.checkins[ws].applied = true;
        });
        toast(`${delta > 0 ? "+" : ""}${delta} kcal a day applied`);
      },
      addPhoto: async (pose, dataUrl) => {
        const id = uid();
        photoCache.set(id, dataUrl);
        const ok = await storage.set(PHOTO_KEY(id), dataUrl);
        update((d) => { d.photos.push({ id, date: todayKey(), pose }); });
        toast(ok ? "Photo saved" : "Photo shown for this session only. Storage unavailable", ok ? undefined : "err");
      },
      deletePhoto: (id) => { storage.del(PHOTO_KEY(id)); photoCache.delete(id); update((d) => { d.photos = d.photos.filter((p) => p.id !== id); }); },
      importState: (s) => setState(migrate(s)),
      resetAll: () => { stateRef.current?.photos.forEach((p) => storage.del(PHOTO_KEY(p.id))); setState(defaultState()); toast("All data erased"); setTab("today"); },

      startWorkout: (k, tplId) => {
        const s = stateRef.current;
        const info = dayInfo(s.profile, k);
        const wk = buildWorkout(info, tplId || info.tplId || missedThisWeek(s, k)[0] || "upper");
        update((d) => {
          d.active = {
            date: k, tplId: wk.tplId, name: wk.name, startedAt: Date.now(), idx: 0, restEnd: null,
            exercises: wk.exercises.map((x) => {
              const t = targetFor(s.sessions, x.exId, x.reps);
              return { exId: x.exId, reps: x.reps, rest: x.rest, sets: [...Array(x.sets)].map((_, i) => ({ w: t.w != null ? String(t.w) : "", r: i === 0 ? String(t.r) : "", done: false })) };
            }),
          };
        });
        setWmOpen(true);
      },
      goWorkout: (k) => {
        const s = stateRef.current;
        if (s.active) { setWmOpen(true); return; }
        if (sessionOn(s, k)) { toast("Session already done today"); setTab("training"); return; }
        A.startWorkout(k);
      },
      finishWorkout: () => {
        const s = stateRef.current;
        const a = s.active;
        const exs = a.exercises.map((x) => ({ exId: x.exId, name: EX[x.exId].name, sets: x.sets.filter((st) => st.done).map((st) => ({ w: Number(st.w) || 0, r: Number(st.r) || 0 })) })).filter((x) => x.sets.length);
        const prList = [];
        exs.forEach((x) => {
          const b = bestSetOf(s.sessions, x.exId);
          const top = x.sets.reduce((m, st) => (e1rm(st.w, st.r) > e1rm(m.w, m.r) ? st : m), x.sets[0]);
          if (b && top.w > 0 && e1rm(top.w, top.r) > e1rm(b.w, b.r) + 0.01) prList.push(`${x.name}: ${top.w} kg × ${top.r}`);
        });
        const sets = exs.reduce((n, x) => n + x.sets.length, 0);
        const sess = {
          id: uid(), date: a.date, tplId: a.tplId, name: a.name, startedAt: a.startedAt, endedAt: Date.now(), exercises: exs, sets,
          volume: Math.round(exs.reduce((v, x) => v + x.sets.reduce((q, st) => q + st.w * st.r, 0), 0)), prs: prList.length, prList,
        };
        update((d) => { if (sets > 0) d.sessions.push(sess); d.active = null; });
        setWmOpen(false);
        if (sets > 0) setSummary(sess);
      },
      discardWorkout: () => { update((d) => { d.active = null; }); setWmOpen(false); toast("Workout discarded"); },
      toggleTask: (k, t) => {
        if (t.kind === "meal") A.toggleMeal(k, t.slot);
        else if (t.kind === "manual") A.toggleHabit(k, t.id);
        else if (t.kind === "auto") A.overrideAuto(k, t);
        else if (t.kind === "weigh") open("weigh", { key: k });
        else if (t.kind === "checkin") open("checkin", { key: k });
        else if (t.kind === "gym") A.goWorkout(k);
      },
    };
    return A;
  }, [update, toast, open]);

  if (!state || !entered) {
    return (<div className="mp"><style>{CSS}</style><Splash ready={!!state} onEnter={() => setEntered(true)} /></div>);
  }

  const ctx = { state, metrics, update, actions, open, toast, setTab };
  const Page = { today: TodayPage, calendar: CalendarPage, training: TrainingPage, nutrition: NutritionPage, progress: ProgressPage, profile: ProfilePage }[tab];
  const go = (t) => { setTab(t); window.scrollTo({ top: 0 }); };

  return (
    <AppCtx.Provider value={ctx}>
      <div className="mp">
        <style>{CSS}</style>
        <div className="shell">
          <aside className="side">
            <div className="brand d up"><div className="b1">Elie</div><div className="b2">Mass protocol</div></div>
            <nav>{TABS.map(([id, l, Icon]) => <button key={id} className={tab === id ? "on" : ""} onClick={() => go(id)}><Icon size={18} />{l}</button>)}</nav>
            <div style={{ marginTop: "auto" }}>
              <div className="lbl">Day {clamp(dayInfo(state.profile, todayKey()).dayNum, 0, 365)} of 365</div>
              <div style={{ marginTop: 8 }}><Bar v={metrics.list.length} max={365} /></div>
              <div className="row" style={{ marginTop: 16, gap: 8 }}><ActivityIcon size={15} color="var(--red)" /><span className="lbl">Streak {metrics.cur}. Week {metrics.week.pct}%</span></div>
            </div>
          </aside>
          <main className="main"><Page key={tab} /></main>
        </div>
        <nav className="bnav">{TABS.map(([id, l, Icon]) => <button key={id} className={tab === id ? "on" : ""} onClick={() => go(id)} aria-label={l}><Icon size={21} strokeWidth={tab === id ? 2.4 : 1.8} />{l}</button>)}</nav>

        {sheet?.type === "recipe" && <RecipeSheet dateKey={sheet.key} slot={sheet.slot} onClose={close} />}
        {sheet?.type === "weigh" && <WeighSheet dateKey={sheet.key} onClose={close} />}
        {sheet?.type === "activity" && <ActivitySheet dateKey={sheet.key} preset={sheet.preset} onClose={close} />}
        {sheet?.type === "checkin" && <CheckinSheet dateKey={sheet.key} onClose={close} />}
        {sheet?.type === "day" && <DaySheet dateKey={sheet.key} onClose={close} />}
        {sheet?.type === "review" && <ReviewSheet ws={sheet.ws} onClose={close} />}
        {sheet?.type === "groceries" && <GroceriesSheet onClose={close} />}

        {state.active && wmOpen && <WorkoutMode onClose={() => setWmOpen(false)} />}
        {summary && <WorkoutSummary s={summary} onDone={() => setSummary(null)} />}
        {celebrate && <DayComplete dayNum={celebrate} onClose={() => setCelebrate(null)} />}
        {toastMsg && <div className={`toast ${toastMsg.kind ? "red" : ""}`} role="status">{toastMsg.kind === "ach" ? <Trophy size={16} /> : toastMsg.kind === "err" ? <X size={16} /> : <Check size={16} strokeWidth={3} />}{toastMsg.msg}</div>}
      </div>
    </AppCtx.Provider>
  );
}
