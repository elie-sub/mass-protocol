import { describe, expect, it } from "vitest";
import { LOCK, computeMetrics, currentStreak, defaultState, weeklySuggestion } from "../lib/metrics";
import { addDays } from "../lib/utils/date";

const recs = (pcts: number[]) => pcts.map((pct) => ({ pct }));

describe("streak", () => {
  it("counts consecutive days at 80%+ ending today", () => {
    expect(currentStreak(recs([100, 50, 80, 90, 85]))).toBe(3);
  });
  it("does not break on an unfinished today", () => {
    expect(currentStreak(recs([90, 85, 20]))).toBe(2);
  });
  it("breaks on a missed yesterday", () => {
    expect(currentStreak(recs([90, 40, 20]))).toBe(0);
  });
  it("computes the streak from real day data", () => {
    const s = defaultState(new Date(2026, 0, 5, 9));
    s.profile.startDate = "2026-01-05";
    const today = "2026-01-08";
    // Tick every task on the first three days.
    for (let i = 0; i < 3; i++) {
      const k = addDays("2026-01-05", i);
      s.weights[k] = 76;
      s.days[k] = { meals: Object.fromEntries(["breakfast", "snack1", "lunch", "snack2", "dinner", "prebed"].map((x) => [x, { eaten: true }])),
        habits: { water: true, creatine: true }, checkin: { energy: "Good", note: "" } };
      s.sessions.push({ id: k, date: k, tplId: "push", name: "Push", startedAt: 0, endedAt: 0, exercises: [], sets: 1, volume: 0, prs: 0, prList: [] });
    }
    const m = computeMetrics(s, today);
    expect(m.list.slice(0, 3).every((r) => r.pct >= LOCK)).toBe(true);
    expect(m.cur).toBe(3);
    expect(m.best).toBe(3);
  });
});

describe("weekly suggestion", () => {
  const base = { wAvg: 78, change: 0.3, twoWeek: 0.6, kcalAdh: 90 };
  it("asks for data first", () => expect(weeklySuggestion({ ...base, wAvg: null }).code).toBe("noData"));
  it("suggests +150 kcal when flat for two weeks with good adherence", () => {
    expect(weeklySuggestion({ ...base, twoWeek: 0.1 })).toEqual({ code: "flat", delta: 150, kcalAdh: 90 });
  });
  it("blames adherence before adding food", () => {
    expect(weeklySuggestion({ ...base, twoWeek: 0.1, kcalAdh: 50 })).toMatchObject({ code: "flatLowAdh", delta: 0 });
  });
  it("suggests -100 kcal when gaining too fast", () => {
    expect(weeklySuggestion({ ...base, change: 0.9 })).toMatchObject({ code: "fast", delta: -100 });
  });
  it("waits for week two", () => expect(weeklySuggestion({ ...base, change: null, twoWeek: null }).code).toBe("firstWeek"));
  it("keeps the plan when on track", () => expect(weeklySuggestion(base)).toMatchObject({ code: "onTrack", delta: 0 }));
});
