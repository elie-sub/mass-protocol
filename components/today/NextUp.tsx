"use client";

import { Check, Play } from "lucide-react";
import type { DayNutrition } from "@/lib/nutrition";
import type { Task } from "@/lib/metrics";
import { useApp } from "@/components/shell/context";

export function NextUp({ tasks, nut, dateKey }: { tasks: Task[]; nut: DayNutrition; dateKey: string }) {
  const { actions, open, t, f } = useApp();
  const pending = tasks.filter((x) => x.counted && !x.done);
  const task = pending.find((x) => !["auto", "manual"].includes(x.kind)) || pending.find((x) => x.kind === "manual");
  if (!task) return null;
  const meal = task.kind === "meal" ? nut.meals.find((m) => m.slot === task.slot)?.meal : null;
  return (
    <div className="card" style={{ borderColor: "var(--line2)", padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "16px 18px 0" }}>
        <div className="lbl">{t.ui.nextUp}</div>
        <div className="h2 d" style={{ fontSize: 30, marginTop: 6 }}>{meal ? f.meal(meal.id).name : f.taskLabel(task)}</div>
        <div className="mute" style={{ marginTop: 6, fontSize: 14 }}>
          {meal ? t.ui.nextMeal(t.slots[task.slot!], f.num(meal.kcal), Math.round(meal.p), meal.prep) : f.taskSub(task)}
        </div>
      </div>
      <div className="row" style={{ padding: 18, gap: 10 }}>
        {task.kind === "meal" && <>
          <button className="btn ghost sm" style={{ flex: 1 }} onClick={() => open("recipe", { key: dateKey, slot: task.slot! })}>{t.ui.viewRecipe}</button>
          <button className="btn sm" style={{ flex: 1 }} onClick={() => actions.toggleTask(dateKey, task)}><Check size={18} strokeWidth={3} />{t.ui.eaten}</button>
        </>}
        {task.kind === "gym" && <button className="btn" onClick={() => actions.goWorkout(dateKey)}><Play size={18} fill="#fff" />{t.ui.startWorkout}</button>}
        {task.kind === "weigh" && <button className="btn" onClick={() => open("weigh", { key: dateKey })}>{t.ui.logWeight}</button>}
        {task.kind === "checkin" && <button className="btn" onClick={() => open("checkin", { key: dateKey })}>{t.ui.checkIn}</button>}
        {task.kind === "manual" && <button className="btn" onClick={() => actions.toggleTask(dateKey, task)}><Check size={18} strokeWidth={3} />{t.ui.done}</button>}
      </div>
    </div>
  );
}
