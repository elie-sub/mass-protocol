"use client";

import { Check, ChevronRight } from "lucide-react";
import type { Task, TaskSec } from "@/lib/metrics";
import { useApp } from "@/components/shell/context";

export function TaskRow({ task, dateKey }: { task: Task; dateKey: string }) {
  const { actions, open, setTab, t, f } = useApp();
  const label = f.taskLabel(task);
  const body = () => {
    if (task.kind === "meal") open("recipe", { key: dateKey, slot: task.slot! });
    else if (task.kind === "gym") actions.goWorkout(dateKey);
    else if (task.kind === "weigh") open("weigh", { key: dateKey });
    else if (task.kind === "checkin") open("checkin", { key: dateKey });
    else if (task.kind === "shop") setTab("groceries");
    else actions.toggleTask(dateKey, task);
  };
  const nav = ["meal", "gym", "weigh", "checkin", "shop"].includes(task.kind);
  return (
    <div className={`task ${task.done ? "done" : ""}`}>
      <button className={`chk ${task.done ? "on" : ""} ${task.kind === "auto" && !task.done ? "auto" : ""}`} onClick={() => actions.toggleTask(dateKey, task)}
        aria-label={task.done ? t.task.uncheck(label) : t.task.check(label)}>
        {task.done && <Check size={17} strokeWidth={3} color="#fff" />}
      </button>
      <button className="tl" style={{ textAlign: "left", minWidth: 0 }} onClick={body}>
        <div className="tt">{label}{task.optional && <span className="chip" style={{ marginLeft: 8, height: 20, fontSize: 11 }}>{t.task.optional}</span>}</div>
        <div className="ts">{f.taskSub(task)}</div>
      </button>
      {nav && <span className="go"><ChevronRight size={18} /></span>}
    </div>
  );
}

const SECS: TaskSec[] = ["Morning", "Midday", "Training", "Evening"];

export function Checklist({ tasks, dateKey }: { tasks: Task[]; dateKey: string }) {
  const { t } = useApp();
  return SECS.map((s) => {
    const ts = tasks.filter((x) => x.sec === s);
    if (!ts.length) return null;
    const c = ts.filter((x) => x.counted);
    return (
      <div key={s}>
        <div className="secname between"><span>{t.secs[s]}</span><span className="n">{c.filter((x) => x.done).length}/{c.length}</span></div>
        {ts.map((x) => <TaskRow key={x.id} task={x} dateKey={dateKey} />)}
      </div>
    );
  });
}
