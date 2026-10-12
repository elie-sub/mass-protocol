import { describe, expect, it } from "vitest";
import { MEAL_BY_ID, baseTargets, dayNutrition, roundQty, scaleMeal, sumMacros } from "../lib/nutrition";
import { defaultState } from "../lib/metrics";

describe("portion scaling", () => {
  it("rounds grams to 5 g under 40 g and to 10 g above", () => {
    expect(roundQty("pb", 23)).toBe(25);
    expect(roundQty("pb", 2)).toBe(5);
    expect(roundQty("oats", 113)).toBe(110);
  });
  it("keeps eggs and slices whole, pieces to halves", () => {
    expect(roundQty("egg", 3.4)).toBe(3);
    expect(roundQty("egg", 0.2)).toBe(1);
    expect(roundQty("bread", 2.6)).toBe(3);
    expect(roundQty("avocado", 0.6)).toBe(0.5);
    expect(roundQty("banana", 1.3)).toBe(1.5);
  });
  it("scales macros with the rounded quantities", () => {
    const m = scaleMeal(MEAL_BY_ID.b1, 1.2);
    expect(m.ing).toEqual([["egg", 4], ["oats", 120], ["wmilk", 300], ["banana", 1], ["pb", 25]]);
    expect(m.kcal).toBeCloseTo(sumMacros(m.ing).kcal);
    const same = scaleMeal(MEAL_BY_ID.b1, 1);
    expect(same.ing).toEqual(MEAL_BY_ID.b1.ing);
  });
  it("scales the day so planned meals land near the calorie target", () => {
    const s = defaultState(new Date(2026, 0, 5, 9));
    const n = dayNutrition(s, s.profile.startDate);
    const planned = n.meals.reduce((a, m) => a + m.meal.kcal, 0);
    expect(Math.abs(planned - n.target.kcal) / n.target.kcal).toBeLessThan(0.12);
  });
});

describe("base targets", () => {
  it("computes Mifflin-St Jeor with surplus, rounded", () => {
    const p = defaultState().profile;
    const t = baseTargets(p, 76);
    // bmr = 760 + 1187.5 - 130 + 5 = 1822.5; *1.45 + 350 = 2992.6 -> 3000
    expect(t.kcal).toBe(3000);
    expect(t.p).toBe(165);
    expect(t.f).toBe(90);
    expect(t.c).toBe(385); // (3000 - 660 - 810) / 4 = 382.5, rounded to 5
  });
  it("uses manual values in manual mode", () => {
    const p = { ...defaultState().profile, nutritionMode: "manual" as const };
    expect(baseTargets(p, 80)).toEqual({ kcal: 3200, p: 170, c: 420, f: 90 });
  });
});
