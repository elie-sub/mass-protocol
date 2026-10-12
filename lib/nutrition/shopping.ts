import { addDays, isoDow, type DateKey } from "../utils/date";
import type { Profile, State } from "../types";
import { FOODS } from "./data";
import { dayNutrition } from "./index";

/* Shopping trips: each shop day covers the days until the next one. Pure. */

export type Aisle = "produce" | "bakery" | "meat" | "dairy" | "frozen" | "starch" | "pantry";
export const AISLES: Aisle[] = ["produce", "bakery", "meat", "dairy", "frozen", "starch", "pantry"];
export const FOOD_AISLE: Record<string, Aisle> = {
  banana: "produce", potato: "produce", sweetpot: "produce", tomato: "produce", avocado: "produce", mango: "produce",
  bread: "bakery", baguette: "bakery", tortilla: "bakery",
  ham: "meat", turkey: "meat", chicken: "meat", beef5: "meat", beef15: "meat", lardons: "meat", salmon: "meat",
  milk: "dairy", wmilk: "dairy", egg: "dairy", skyr: "dairy", fblanc: "dairy", butter: "dairy", emmental: "dairy",
  cheese: "dairy", parmesan: "dairy", hummus: "dairy", gnocchi: "dairy", pesto: "dairy",
  veg: "frozen", edamame: "frozen",
  oats: "starch", rice: "starch", pasta: "starch", granola: "starch",
  pb: "pantry", honey: "pantry", jam: "pantry", tomsauce: "pantry", oil: "pantry", soy: "pantry", chickpeas: "pantry",
  tuna: "pantry", almonds: "pantry", nuts: "pantry", dates: "pantry", chili: "pantry", curry: "pantry",
};

const DEFAULT_SHOP_DAYS = [0, 3];
const daysOf = (p: Pick<Profile, "shopDays">) => (p.shopDays?.length ? p.shopDays : DEFAULT_SHOP_DAYS);

export interface Trip { start: DateKey; end: DateKey }

/** The trip whose window contains `key`: from the latest shop day on or before it, to the day before the next one. */
export function tripFor(profile: Pick<Profile, "shopDays">, key: DateKey): Trip {
  const days = daysOf(profile);
  let start = key;
  for (let i = 0; i < 7 && !days.includes(isoDow(start)); i++) start = addDays(start, -1);
  let next = addDays(start, 1);
  for (let i = 0; i < 7 && !days.includes(isoDow(next)); i++) next = addDays(next, 1);
  return { start, end: addDays(next, -1) };
}
export const nextTrip = (profile: Pick<Profile, "shopDays">, t: Trip) => tripFor(profile, addDays(t.end, 1));
export const isShopDay = (profile: Pick<Profile, "shopDays">, key: DateKey) => daysOf(profile).includes(isoDow(key));

export interface ShopItem { fid: string; qty: number; aisle: Aisle }

/** Everything the planned meals need over the trip, with current portions and swaps. */
export function shoppingList(state: State, trip: Trip): ShopItem[] {
  const tot: Record<string, number> = {};
  // Days before Day 1 have no plan to shop for.
  for (let k = trip.start < state.profile.startDate ? state.profile.startDate : trip.start; k <= trip.end; k = addDays(k, 1)) {
    dayNutrition(state, k).meals.forEach((m) => m.meal.ing.forEach(([fid, q]) => { tot[fid] = (tot[fid] || 0) + q; }));
  }
  return Object.entries(tot).map(([fid, qty]) => ({ fid, qty, aisle: FOOD_AISLE[fid] ?? "pantry" }))
    .filter((x) => FOODS[x.fid]);
}
