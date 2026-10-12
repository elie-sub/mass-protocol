import { describe, expect, it } from "vitest";
import { diffState, isEmpty } from "../lib/data/diff";
import { defaultState, migrate } from "../lib/metrics";

describe("state diff", () => {
  it("is empty for identical states", () => {
    const s = defaultState();
    expect(isEmpty(diffState(s, structuredClone(s)))).toBe(true);
  });
  it("pushes everything against an empty remote", () => {
    const s = defaultState();
    s.weights["2026-01-05"] = 76.2;
    const o = diffState(null, s);
    expect(o.profile).toEqual(s.profile);
    expect(o.weights.upsert).toEqual([["2026-01-05", 76.2]]);
  });
  it("detects row-level upserts and deletes", () => {
    const a = defaultState();
    a.weights = { "2026-01-05": 76, "2026-01-06": 76.4 };
    a.activities = [{ id: "x", date: "2026-01-05", type: "padel", duration: 90, intensity: "medium" }];
    a.seenAch = ["first_blood"];
    const b = structuredClone(a);
    delete b.weights["2026-01-05"];
    b.weights["2026-01-06"] = 76.5;
    b.activities = [];
    b.days["2026-01-06"] = { habits: { water: true } };
    b.seenAch = ["first_blood", "full_day"];
    const o = diffState(a, b);
    expect(o.profile).toBe(null);
    expect(o.active).toBe(undefined);
    expect(o.weights).toEqual({ upsert: [["2026-01-06", 76.5]], del: ["2026-01-05"] });
    expect(o.activities).toEqual({ upsert: [], del: ["x"] });
    expect(o.days.upsert).toEqual([["2026-01-06", { habits: { water: true } }]]);
    expect(o.ach).toEqual({ add: ["full_day"], del: [] });
  });
  it("ignores key order (Postgres jsonb reorders keys)", () => {
    const a = defaultState();
    a.days["2026-01-05"] = { checkin: { energy: "Good", note: "x" }, habits: { water: true } };
    const b = structuredClone(a);
    b.days["2026-01-05"] = { habits: { water: true }, checkin: { note: "x", energy: "Good" } };
    expect(isEmpty(diffState(a, b))).toBe(true);
  });
  it("migrates a V1 backup without the new fields", () => {
    const v1 = { v: 1, profile: { name: "Elie", startDate: "2026-01-05", prefs: { noFish: true } }, days: {}, weights: { "2026-01-05": 76 } };
    const s = migrate(v1);
    expect(s.profile.lang).toBe("fr");
    expect(s.profile.prefs).toEqual({ noCook: false, noFish: true, noPork: false });
    expect(s.sessions).toEqual([]);
  });
});
