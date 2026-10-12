import type { SupabaseClient } from "@supabase/supabase-js";
import { PHOTO_BUCKET } from "../supabase/client";
import { defaultState, migrate } from "../metrics";
import { photoStore, type Repo } from "./repo";
import type { Ops } from "./diff";
import type { MeasKey, Profile, Session } from "../types";

/* Supabase repository. Tables are described in supabase/migrations. RLS scopes every row to auth.uid(). */

const MEAS: MeasKey[] = ["chest", "waist", "arms", "thighs", "shoulders"];
const iso = (ms: number | undefined | null) => (ms ? new Date(ms).toISOString() : null);
const ms = (s: string | null) => (s ? new Date(s).getTime() : 0);

/* eslint-disable @typescript-eslint/no-explicit-any */
const profileToRow = (p: Profile) => ({
  name: p.name, age: p.age, height_cm: p.heightCm, start_weight: p.startWeight, goal_weight: p.goalWeight, start_date: p.startDate,
  sessions_per_week: String(p.sessionsPerWeek), padel_days: p.padelDays, activity: p.activity, surplus: p.surplus,
  kcal_adjust: p.kcalAdjust, protein_per_kg: p.proteinPerKg, nutrition_mode: p.nutritionMode, manual: p.manual,
  water_l: p.waterL, creatine: p.creatine, prefs: p.prefs, lang: p.lang, shop_days: p.shopDays, updated_at: new Date().toISOString(),
});
const rowToProfile = (r: any): Profile => ({
  name: r.name, age: r.age, heightCm: r.height_cm, startWeight: r.start_weight, goalWeight: r.goal_weight, startDate: r.start_date,
  sessionsPerWeek: r.sessions_per_week === "auto" ? "auto" : (Number(r.sessions_per_week) as 4 | 5), padelDays: r.padel_days ?? [],
  activity: r.activity, surplus: r.surplus, kcalAdjust: r.kcal_adjust, proteinPerKg: r.protein_per_kg, nutritionMode: r.nutrition_mode,
  manual: r.manual, waterL: r.water_l, creatine: r.creatine, prefs: r.prefs, lang: r.lang, shopDays: r.shop_days ?? [0, 3],
});

function check<T extends { error: any }>(res: T): T {
  if (res.error) throw new Error(res.error.message || "Supabase error");
  return res;
}

export function supabaseRepo(sb: SupabaseClient, userId: string): Repo {
  const photoPath = (id: string) => `${userId}/${id}.jpg`;
  const signed = new Map<string, { url: string; exp: number }>();

  return {
    mode: "supabase",

    async load() {
      // PostgREST caps responses at 1000 rows: page through the long tables.
      const all = async (t: string, order: string[] = []) => {
        const out: any[] = [];
        for (let from = 0; ; from += 1000) {
          let q = sb.from(t).select("*");
          order.forEach((c) => { q = q.order(c); });
          const { data } = check(await q.range(from, from + 999));
          out.push(...(data ?? []));
          if (!data || data.length < 1000) return out;
        }
      };
      const one = async (t: string) => check(await sb.from(t).select("*").maybeSingle());
      const [prof, days, weights, sessions, sets, draft, acts, meas, photos, checkins, ach] = await Promise.all([
        one("profiles"), all("day_logs", ["date"]), all("body_weights", ["date"]), all("workout_sessions", ["started_at"]),
        all("exercise_sets", ["session_id", "ex_order", "set_order"]), one("workout_drafts"),
        all("activities", ["date"]), all("body_measurements", ["date"]), all("progress_photos", ["date"]), all("weekly_checkins", ["week_start"]),
        all("achievements_unlocked"),
      ]) as any[];
      if (!prof.data) return null;
      const d = defaultState();
      const setsBy = new Map<string, any[]>();
      (sets as any[]).forEach((r) => { const a = setsBy.get(r.session_id) ?? []; a.push(r); setsBy.set(r.session_id, a); });
      const sessionsOut: Session[] = (sessions as any[]).map((r) => {
        const exs: Session["exercises"] = [];
        (setsBy.get(r.id) ?? []).forEach((s) => {
          (exs[s.ex_order] ??= { exId: s.ex_id, name: s.ex_name, sets: [] }).sets[s.set_order] = { w: s.weight, r: s.reps };
        });
        return {
          id: r.id, date: r.date, tplId: r.tpl_id, name: r.name, startedAt: ms(r.started_at), endedAt: ms(r.ended_at),
          exercises: exs.filter(Boolean), sets: r.sets, volume: r.volume, prs: r.prs, prList: r.pr_list ?? [],
        };
      });
      return migrate({
        ...d,
        profile: rowToProfile(prof.data),
        days: Object.fromEntries((days as any[]).map((r) => [r.date, Object.fromEntries(
          Object.entries({ meals: r.meals, habits: r.habits, checkin: r.checkin, note: r.note, extras: r.extras, shopping: r.shopping }).filter(([, v]) => v != null),
        )])),
        weights: Object.fromEntries((weights as any[]).map((r) => [r.date, r.kg])),
        sessions: sessionsOut,
        active: (draft.data as any)?.data ?? null,
        activities: (acts as any[]).map((r) => ({ id: r.id, date: r.date, type: r.type, duration: r.duration, intensity: r.intensity })),
        measurements: (meas as any[]).map((r) => ({ id: r.id, date: r.date, ...Object.fromEntries(MEAS.filter((k) => r[k] != null).map((k) => [k, r[k]])) })),
        photos: (photos as any[]).map((r) => ({ id: r.id, date: r.date, pose: r.pose, path: r.path })),
        checkins: Object.fromEntries((checkins as any[]).map((r) => [r.week_start, {
          answers: r.answers, stats: r.stats, suggestion: r.suggestion, ...(r.suggestion_code ? { suggestionCode: r.suggestion_code } : {}),
          ...(r.applied ? { applied: true } : {}), ...(r.submitted_at ? { submittedAt: ms(r.submitted_at) } : {}),
        }])),
        seenAch: (ach as any[]).map((r) => r.ach_id),
      });
    },

    async apply(o: Ops) {
      const up = (t: string, rows: any[], onConflict: string) => (rows.length ? sb.from(t).upsert(rows.map((r) => ({ user_id: userId, ...r })), { onConflict }).then(check) : null);
      const del = (t: string, col: string, ids: string[]) => (ids.length ? sb.from(t).delete().in(col, ids).then(check) : null);

      if (o.profile) await up("profiles", [profileToRow(o.profile)], "user_id");
      if (o.active !== undefined) {
        await (o.active ? up("workout_drafts", [{ data: o.active, updated_at: new Date().toISOString() }], "user_id") : sb.from("workout_drafts").delete().eq("user_id", userId).then(check));
      }
      // Sessions first: exercise_sets reference them.
      await del("workout_sessions", "id", o.sessions.del);
      if (o.sessions.upsert.length) {
        await up("workout_sessions", o.sessions.upsert.map((s) => ({
          id: s.id, date: s.date, tpl_id: s.tplId, name: s.name, started_at: iso(s.startedAt), ended_at: iso(s.endedAt),
          sets: s.sets, volume: s.volume, prs: s.prs, pr_list: s.prList,
        })), "user_id,id");
        await del("exercise_sets", "session_id", o.sessions.upsert.map((s) => s.id));
        await up("exercise_sets", o.sessions.upsert.flatMap((s) => s.exercises.flatMap((x, i) => x.sets.map((st, j) => ({
          session_id: s.id, ex_order: i, ex_id: x.exId, ex_name: x.name, set_order: j, weight: st.w, reps: st.r,
        })))), "user_id,session_id,ex_order,set_order");
      }
      await Promise.all([
        up("day_logs", o.days.upsert.map(([date, v]) => ({
          date, meals: v.meals ?? null, habits: v.habits ?? null, checkin: v.checkin ?? null, note: v.note ?? null, extras: v.extras ?? null,
          shopping: v.shopping ?? null, updated_at: new Date().toISOString(),
        })), "user_id,date"),
        del("day_logs", "date", o.days.del),
        up("body_weights", o.weights.upsert.map(([date, kg]) => ({ date, kg })), "user_id,date"),
        del("body_weights", "date", o.weights.del),
        up("weekly_checkins", o.checkins.upsert.map(([ws, c]) => ({
          week_start: ws, answers: c.answers, stats: c.stats, suggestion: c.suggestion, suggestion_code: c.suggestionCode ?? null,
          applied: !!c.applied, submitted_at: iso(c.submittedAt),
        })), "user_id,week_start"),
        del("weekly_checkins", "week_start", o.checkins.del),
        up("activities", o.activities.upsert, "user_id,id"),
        del("activities", "id", o.activities.del),
        up("body_measurements", o.measurements.upsert.map((m) => ({ id: m.id, date: m.date, ...Object.fromEntries(MEAS.map((k) => [k, m[k] ?? null])) })), "user_id,id"),
        del("body_measurements", "id", o.measurements.del),
        up("progress_photos", o.photos.upsert.map((p) => ({ id: p.id, date: p.date, pose: p.pose, path: p.path ?? photoPath(p.id) })), "user_id,id"),
        del("progress_photos", "id", o.photos.del),
        up("achievements_unlocked", o.ach.add.map((ach_id) => ({ ach_id })), "user_id,ach_id"),
        del("achievements_unlocked", "ach_id", o.ach.del),
      ]);
      if (o.photos.del.length) {
        await sb.storage.from(PHOTO_BUCKET).remove(o.photos.del.map(photoPath));
        await Promise.all(o.photos.del.map((id) => photoStore.del(id)));
      }
    },

    async putPhoto(id, blob) {
      const path = photoPath(id);
      await photoStore.put(id, blob).catch(() => {});
      const { error } = await sb.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: "image/jpeg", upsert: true });
      if (error) throw new Error(error.message);
      return path;
    },

    async photoUrl(id, path) {
      const local = await photoStore.get(id);
      if (local) return URL.createObjectURL(local);
      const hit = signed.get(id);
      if (hit && hit.exp > Date.now()) return hit.url;
      const { data } = await sb.storage.from(PHOTO_BUCKET).createSignedUrl(path ?? photoPath(id), 3600);
      if (!data?.signedUrl) return null;
      signed.set(id, { url: data.signedUrl, exp: Date.now() + 3300e3 });
      return data.signedUrl;
    },
  };
}
