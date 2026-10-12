import { describe, expect, it } from "vitest";
import { buildWorkout, dayInfo, targetFor } from "../lib/program";
import type { Session } from "../lib/types";

const sess = (exId: string, sets: [number, number][], date = "2026-01-05"): Session => ({
  id: date, date, tplId: "push", name: "Push", startedAt: 0, endedAt: 0, sets: sets.length, volume: 0, prs: 0, prList: [],
  exercises: [{ exId, name: exId, sets: sets.map(([w, r]) => ({ w, r })) }],
});

describe("targetFor (progressive overload)", () => {
  it("asks for a first working weight with no history", () => {
    expect(targetFor([], "bench", [6, 8])).toEqual({ kind: "first", w: null, r: 8, lo: 6, hi: 8 });
  });
  it("adds weight when every top set hit the top of the range", () => {
    expect(targetFor([sess("bench", [[60, 8], [60, 8], [60, 9]])], "bench", [6, 8])).toEqual({ kind: "add", w: 62.5, r: 6 });
  });
  it("adds a rep otherwise, capped at the top of the range", () => {
    expect(targetFor([sess("bench", [[60, 8], [60, 6]])], "bench", [6, 8])).toEqual({ kind: "rep", w: 60, r: 8 });
    expect(targetFor([sess("bench", [[60, 6], [57.5, 9]])], "bench", [6, 8])).toEqual({ kind: "rep", w: 60, r: 7 });
  });
  it("uses the exercise increment and the latest session", () => {
    const s = [sess("cable_lat", [[10, 10]], "2026-01-01"), sess("cable_lat", [[10, 15], [10, 15]], "2026-01-08")];
    expect(targetFor(s, "cable_lat", [12, 15])).toEqual({ kind: "add", w: 11.25, r: 12 });
  });
});

describe("program calendar", () => {
  const profile = { startDate: "2026-01-05", sessionsPerWeek: "auto" as const, padelDays: [0, 1, 2] };
  it("runs 4 sessions in phase 1 and 5 from phase 2", () => {
    expect(dayInfo(profile, "2026-01-05").tplId).toBe("push");
    expect(dayInfo(profile, "2026-01-09").tplId).toBe(null);
    expect(dayInfo(profile, "2026-03-06").phase.id).toBe(2);
    expect(dayInfo(profile, "2026-03-06").tplId).toBe("upper");
  });
  it("trims a set in the first three weeks and on deload weeks", () => {
    const w1 = buildWorkout(dayInfo(profile, "2026-01-05"))!;
    expect(w1.exercises[0].sets).toBe(3);
    const deload = dayInfo(profile, "2026-02-23");
    expect(deload.deload).toBe(true);
    expect(buildWorkout(deload)!.note).toBe("deload");
  });
});
