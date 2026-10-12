import { describe, expect, it } from "vitest";
import { isShopDay, nextTrip, shoppingList, tripFor } from "../lib/nutrition/shopping";
import { dayNutrition } from "../lib/nutrition";
import { dayTasks, defaultState, scoreOf } from "../lib/metrics";

const profile = { shopDays: [0, 3] }; // Monday + Thursday

describe("shopping trips", () => {
  it("Monday covers Monday to Wednesday", () => {
    expect(tripFor(profile, "2026-10-12")).toEqual({ start: "2026-10-12", end: "2026-10-14" });
    expect(tripFor(profile, "2026-10-14")).toEqual({ start: "2026-10-12", end: "2026-10-14" });
  });
  it("Thursday covers Thursday to Sunday", () => {
    expect(tripFor(profile, "2026-10-15")).toEqual({ start: "2026-10-15", end: "2026-10-18" });
    expect(tripFor(profile, "2026-10-18")).toEqual({ start: "2026-10-15", end: "2026-10-18" });
    expect(nextTrip(profile, tripFor(profile, "2026-10-16")).start).toBe("2026-10-19");
  });
  it("works with a single weekly shop", () => {
    expect(tripFor({ shopDays: [5] }, "2026-10-14")).toEqual({ start: "2026-10-10", end: "2026-10-16" });
  });
  it("sums the planned meals of every day in the trip", () => {
    const s = defaultState(new Date(2026, 9, 12, 9));
    s.profile.startDate = "2026-10-12";
    const trip = tripFor(s.profile, "2026-10-12");
    const list = shoppingList(s, trip);
    let oats = 0;
    for (const k of ["2026-10-12", "2026-10-13", "2026-10-14"]) dayNutrition(s, k).meals.forEach((m) => m.meal.ing.forEach(([fid, q]) => { if (fid === "oats") oats += q; }));
    expect(list.find((x) => x.fid === "oats")?.qty ?? 0).toBe(oats);
    expect(list.every((x) => x.aisle)).toBe(true);
  });
  it("adds a reminder on shop days that never changes the score", () => {
    const s = defaultState(new Date(2026, 9, 12, 9));
    s.profile.startDate = "2026-10-12";
    expect(isShopDay(s.profile, "2026-10-12")).toBe(true);
    const tasks = dayTasks(s, "2026-10-12");
    const shop = tasks.find((x) => x.id === "shop")!;
    expect(shop.counted).toBe(false);
    s.days["2026-10-12"] = { habits: { shop: true } };
    expect(scoreOf(dayTasks(s, "2026-10-12"))).toEqual(scoreOf(tasks));
    expect(dayTasks(s, "2026-10-13").some((x) => x.id === "shop")).toBe(false);
  });
});
