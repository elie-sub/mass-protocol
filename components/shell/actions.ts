import { dayInfo, bestSetOf, buildWorkout, e1rm, missedThisWeek, targetFor, type TplId } from "@/lib/program";
import { defaultState, migrate, sessionOn, type Task } from "@/lib/metrics";
import { todayKey, uid } from "@/lib/utils/date";
import { DICTS, type Dict } from "@/lib/i18n";
import type { Repo } from "@/lib/data/repo";
import type { Activity, Checkin, DayLog, Extra, Measurement, Pose, Profile, Session, State, WeeklyCheckin } from "@/lib/types";
import type { AppCtx, Tab } from "./context";

interface Deps {
  update: (fn: (d: State) => void) => void;
  replace: (s: State) => void;
  getState: () => State;
  toast: AppCtx["toast"];
  open: AppCtx["open"];
  setTab: (t: Tab) => void;
  setWorkoutOpen: (v: boolean) => void;
  setSummary: (s: Session) => void;
  repo: Repo;
  t: () => Dict;
}

export function makeActions({ update, replace, getState, toast, open, setTab, setWorkoutOpen, setSummary, repo, t }: Deps) {
  const day = (d: State, k: string): DayLog => (d.days[k] = d.days[k] || {});
  const mealOf = (d: State, k: string, slot: string) => {
    const dd = day(d, k);
    dd.meals = dd.meals || {};
    return (dd.meals[slot as keyof typeof dd.meals] = dd.meals[slot as keyof typeof dd.meals] || {});
  };

  const A = {
    toggleMeal: (k: string, slot: string) => update((d) => { const m = mealOf(d, k, slot); m.eaten = !m.eaten; }),
    swapMeal: (k: string, slot: string, id: string | null) => update((d) => { const m = mealOf(d, k, slot); if (id) m.swap = id; else delete m.swap; }),
    toggleHabit: (k: string, id: string) => update((d) => { const dd = day(d, k); dd.habits = dd.habits || {}; dd.habits[id] = !dd.habits[id]; }),
    overrideAuto: (k: string, task: Task) => update((d) => {
      const dd = day(d, k); dd.habits = dd.habits || {};
      const v = !task.done;
      if (v === task.auto) delete dd.habits[task.id]; else dd.habits[task.id] = v;
    }),
    setWeight: (k: string, w: number | null) => update((d) => { if (w == null) delete d.weights[k]; else d.weights[k] = w; }),
    setCheckin: (k: string, c: Checkin) => update((d) => { day(d, k).checkin = c; }),
    toggleShopItem: (tripStart: string, fid: string) => update((d) => {
      const dd = day(d, tripStart);
      const cur = new Set(dd.shopping || []);
      if (cur.has(fid)) cur.delete(fid); else cur.add(fid);
      dd.shopping = [...cur];
    }),
    clearShopping: (tripStart: string) => update((d) => { delete day(d, tripStart).shopping; }),
    setNote: (k: string, note: string) => update((d) => { day(d, k).note = note; }),
    addExtra: (k: string, x: Omit<Extra, "id">) => update((d) => { const dd = day(d, k); dd.extras = [...(dd.extras || []), { id: uid(), ...x }]; }),
    removeExtra: (k: string, id: string) => update((d) => { const dd = day(d, k); dd.extras = (dd.extras || []).filter((x) => x.id !== id); }),
    addActivity: (a: Omit<Activity, "id">) => { update((d) => { d.activities.push({ id: uid(), ...a }); }); toast(t().ui.logged(t().act[a.type])); },
    removeActivity: (id: string) => update((d) => { d.activities = d.activities.filter((a) => a.id !== id); }),
    addMeasurement: (m: Omit<Measurement, "id">) => { update((d) => { d.measurements.push({ id: uid(), ...m } as Measurement); }); toast(t().ui.measSaved); },
    removeMeasurement: (id: string) => update((d) => { d.measurements = d.measurements.filter((m) => m.id !== id); }),
    updateProfile: (p: Partial<Profile>) => update((d) => { d.profile = { ...d.profile, ...p }; }),
    submitReview: (ws: string, r: Omit<WeeklyCheckin, "submittedAt">) => {
      update((d) => { d.checkins[ws] = { ...(d.checkins[ws] || {}), ...r, submittedAt: Date.now() }; });
      toast(t().ui.weekSubmitted);
    },
    applyAdjust: (ws: string, delta: number) => {
      update((d) => {
        if (d.profile.nutritionMode === "manual") { d.profile.manual.kcal += delta; d.profile.manual.carbs += Math.round(delta / 4); }
        else d.profile.kcalAdjust += delta;
        d.checkins[ws].applied = true;
      });
      toast(t().ui.appliedToast(`${delta > 0 ? "+" : ""}${delta}`));
    },
    addPhoto: async (pose: Pose, blob: Blob) => {
      const id = uid();
      try {
        const path = await repo.putPhoto(id, blob);
        update((d) => { d.photos.push({ id, date: todayKey(), pose, path }); });
        toast(t().ui.photoSaved);
      } catch {
        toast(t().ui.photoLocal, "err");
      }
    },
    deletePhoto: (id: string) => update((d) => { d.photos = d.photos.filter((p) => p.id !== id); }),
    importState: (s: unknown) => {
      // V1 backups exclude photos; keep the photos already stored on this account.
      const cur = getState();
      const next = migrate(s);
      replace({ ...next, photos: next.photos.length ? next.photos : cur.photos });
    },
    resetAll: () => {
      const lang = getState().profile.lang;
      const d = defaultState();
      replace({ ...d, profile: { ...d.profile, lang } });
      toast(DICTS[lang].ui.erased);
      setTab("today");
    },

    startWorkout: (k: string, tplId?: TplId | null) => {
      const s = getState();
      const info = dayInfo(s.profile, k);
      const wk = buildWorkout(info, tplId || info.tplId || missedThisWeek(s.profile, s.sessions, k)[0] || "upper")!;
      update((d) => {
        d.active = {
          date: k, tplId: wk.tplId, name: DICTS.en.tpl[wk.tplId].name, startedAt: Date.now(), idx: 0, restEnd: null,
          exercises: wk.exercises.map((x) => {
            const tg = targetFor(s.sessions, x.exId, x.reps);
            return { exId: x.exId, reps: x.reps, rest: x.rest, sets: [...Array(x.sets)].map((_, i) => ({ w: tg.w != null ? String(tg.w) : "", r: i === 0 ? String(tg.r) : "", done: false })) };
          }),
        };
      });
      setWorkoutOpen(true);
    },
    goWorkout: (k: string) => {
      const s = getState();
      if (s.active) { setWorkoutOpen(true); return; }
      if (sessionOn(s, k)) { toast(t().ui.sessionDoneToday); setTab("training"); return; }
      A.startWorkout(k);
    },
    finishWorkout: () => {
      const s = getState();
      const a = s.active!;
      const exs = a.exercises.map((x) => ({
        exId: x.exId, name: DICTS.en.ex[x.exId]?.[0] ?? x.exId,
        sets: x.sets.filter((st) => st.done).map((st) => ({ w: Number(st.w) || 0, r: Number(st.r) || 0 })),
      })).filter((x) => x.sets.length);
      const prList: Session["prList"] = [];
      exs.forEach((x) => {
        const b = bestSetOf(s.sessions, x.exId);
        const top = x.sets.reduce((m, st) => (e1rm(st.w, st.r) > e1rm(m.w, m.r) ? st : m), x.sets[0]);
        if (b && top.w > 0 && e1rm(top.w, top.r) > e1rm(b.w, b.r) + 0.01) prList.push({ exId: x.exId, w: top.w, r: top.r });
      });
      const sets = exs.reduce((n, x) => n + x.sets.length, 0);
      const sess: Session = {
        id: uid(), date: a.date, tplId: a.tplId, name: a.name, startedAt: a.startedAt, endedAt: Date.now(), exercises: exs, sets,
        volume: Math.round(exs.reduce((v, x) => v + x.sets.reduce((q, st) => q + st.w * st.r, 0), 0)), prs: prList.length, prList,
      };
      update((d) => { if (sets > 0) d.sessions.push(sess); d.active = null; });
      setWorkoutOpen(false);
      if (sets > 0) setSummary(sess);
    },
    discardWorkout: () => { update((d) => { d.active = null; }); setWorkoutOpen(false); toast(t().ui.workoutDiscarded); },
    toggleTask: (k: string, task: Task) => {
      if (task.kind === "meal") A.toggleMeal(k, task.slot!);
      else if (task.kind === "manual" || task.kind === "shop") A.toggleHabit(k, task.id);
      else if (task.kind === "auto") A.overrideAuto(k, task);
      else if (task.kind === "weigh") open("weigh", { key: k });
      else if (task.kind === "checkin") open("checkin", { key: k });
      else if (task.kind === "gym") A.goWorkout(k);
    },
  };
  return A;
}
export type Actions = ReturnType<typeof makeActions>;
