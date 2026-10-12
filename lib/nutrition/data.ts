/* Food and meal library. Names, steps and tips live in lib/i18n. */

export type Unit = "g" | "ml" | "pc" | "slice" | "tbsp";
// [unit, kcal, protein, carbs, fat] per 100 g/ml, or per piece/slice/tbsp
export const FOODS: Record<string, [Unit, number, number, number, number]> = {
  oats: ["g", 370, 13, 60, 7], milk: ["ml", 46, 3.3, 4.8, 1.6], wmilk: ["ml", 64, 3.2, 4.8, 3.6],
  egg: ["pc", 78, 6.5, 0.5, 5.5], banana: ["pc", 105, 1.3, 27, 0.4], pb: ["g", 600, 25, 15, 50],
  skyr: ["g", 63, 11, 4, 0.2], fblanc: ["g", 75, 7.5, 4, 3.2], honey: ["g", 320, 0.3, 80, 0],
  granola: ["g", 450, 9, 62, 17], bread: ["slice", 100, 4, 17, 1.3], baguette: ["g", 270, 9, 55, 1.5],
  butter: ["g", 740, 0.7, 0.6, 82], jam: ["g", 250, 0.5, 60, 0], ham: ["g", 115, 20, 1, 3.5],
  turkey: ["g", 105, 22, 1, 1.5], emmental: ["g", 380, 28, 0, 30], cheese: ["g", 350, 25, 0, 27],
  parmesan: ["g", 400, 33, 0, 28], chicken: ["g", 110, 23, 0, 1.5], rice: ["g", 355, 7, 78, 0.8],
  pasta: ["g", 355, 12.5, 71, 1.5], gnocchi: ["g", 150, 4, 32, 0.5], potato: ["g", 80, 2, 17, 0.1],
  sweetpot: ["g", 86, 1.6, 20, 0.1], beef5: ["g", 125, 21, 0, 5], beef15: ["g", 215, 18, 0, 15],
  lardons: ["g", 270, 15, 0, 23], salmon: ["g", 200, 20, 0, 13], tuna: ["g", 115, 26, 0, 1],
  veg: ["g", 50, 2.5, 7, 0.5], tomsauce: ["g", 40, 1.5, 7, 0.3], tomato: ["g", 18, 0.9, 3.9, 0.2],
  oil: ["g", 900, 0, 0, 100], avocado: ["pc", 240, 3, 13, 22], edamame: ["g", 120, 11, 9, 5],
  mango: ["g", 60, 0.8, 15, 0.4], soy: ["tbsp", 10, 1, 1, 0], chickpeas: ["g", 140, 7, 18, 3],
  tortilla: ["pc", 180, 5, 30, 4.5], hummus: ["g", 300, 7, 12, 25], almonds: ["g", 600, 21, 10, 52],
  nuts: ["g", 620, 18, 15, 53], dates: ["g", 280, 2.5, 70, 0.4], chili: ["g", 120, 8, 12, 4],
  pesto: ["g", 450, 5, 5, 45], curry: ["tbsp", 6, 0.3, 1, 0.3],
};
export const INT_FOODS = new Set(["egg", "tortilla"]);

export type LibSlot = "breakfast" | "snack" | "lunch" | "dinner" | "prebed" | "fuel";
export type Ing = [string, number];
export interface MealDef { id: string; slot: LibSlot; prep: number; ing: Ing[]; noCook: boolean; tags: string[]; hasTip: boolean }

const M = (id: string, slot: LibSlot, prep: number, ing: Ing[], o: { noCook?: boolean; tags?: string[]; tip?: boolean } = {}): MealDef =>
  ({ id, slot, prep, ing, noCook: !!o.noCook, tags: o.tags || [], hasTip: !!o.tip });

export const MEALS: MealDef[] = [
  M("b1", "breakfast", 10, [["egg", 3], ["oats", 100], ["wmilk", 250], ["banana", 1], ["pb", 20]]),
  M("b2", "breakfast", 3, [["skyr", 300], ["granola", 80], ["banana", 1], ["honey", 15], ["almonds", 20]], { noCook: true }),
  M("b3", "breakfast", 8, [["egg", 4], ["bread", 3], ["butter", 10], ["emmental", 30]]),
  M("b4", "breakfast", 5, [["fblanc", 250], ["oats", 80], ["milk", 150], ["pb", 20], ["banana", 1]], { noCook: true, tip: true }),
  M("b5", "breakfast", 3, [["baguette", 120], ["butter", 15], ["jam", 30], ["skyr", 200], ["milk", 250]], { noCook: true }),

  M("s1", "snack", 1, [["skyr", 200], ["banana", 1], ["almonds", 25]], { noCook: true }),
  M("s2", "snack", 3, [["baguette", 100], ["ham", 60], ["emmental", 25], ["butter", 10]], { noCook: true, tags: ["pork"] }),
  M("s3", "snack", 2, [["fblanc", 200], ["granola", 50], ["honey", 10]], { noCook: true }),
  M("s4", "snack", 3, [["tortilla", 1], ["turkey", 80], ["cheese", 20], ["hummus", 30]], { noCook: true }),
  M("s5", "snack", 4, [["bread", 2], ["pb", 30], ["banana", 1], ["milk", 300]], { noCook: true }),
  M("s6", "snack", 3, [["baguette", 100], ["tuna", 100], ["butter", 10]], { noCook: true, tags: ["fish"] }),
  M("s7", "snack", 1, [["nuts", 30], ["dates", 30], ["skyr", 150]], { noCook: true }),

  M("l1", "lunch", 15, [["chicken", 200], ["rice", 120], ["avocado", 0.5], ["veg", 150], ["oil", 10], ["soy", 1]]),
  M("l2", "lunch", 15, [["salmon", 150], ["rice", 120], ["edamame", 80], ["mango", 80], ["avocado", 0.5], ["soy", 1]], { tags: ["fish"], tip: true }),
  M("l3", "lunch", 15, [["pasta", 130], ["beef5", 180], ["tomsauce", 200], ["parmesan", 20], ["oil", 10]]),
  M("l4", "lunch", 12, [["tuna", 140], ["rice", 110], ["chickpeas", 100], ["tomato", 150], ["oil", 15]], { tags: ["fish"], tip: true }),
  M("l5", "lunch", 5, [["chili", 400], ["baguette", 80], ["cheese", 30]], { noCook: true }),
  M("l6", "lunch", 12, [["gnocchi", 300], ["chicken", 180], ["pesto", 30], ["parmesan", 15]]),

  M("d1", "dinner", 25, [["salmon", 180], ["potato", 350], ["veg", 150], ["butter", 10]], { tags: ["fish"] }),
  M("d2", "dinner", 15, [["beef15", 200], ["pasta", 120], ["cheese", 30], ["tomsauce", 100]]),
  M("d3", "dinner", 20, [["chicken", 200], ["rice", 110], ["tomsauce", 150], ["veg", 100], ["oil", 10], ["curry", 1]]),
  M("d4", "dinner", 15, [["pasta", 140], ["lardons", 100], ["egg", 2], ["parmesan", 20]], { tags: ["pork"] }),
  M("d5", "dinner", 20, [["beef5", 200], ["sweetpot", 350], ["avocado", 0.5], ["cheese", 20]]),
  M("d6", "dinner", 0, [["chicken", 180], ["rice", 110], ["edamame", 80], ["avocado", 0.5], ["mango", 60]], { noCook: true, tip: true }),

  M("p1", "prebed", 1, [["fblanc", 250], ["honey", 10], ["almonds", 20]], { noCook: true }),
  M("p2", "prebed", 1, [["skyr", 200], ["pb", 20]], { noCook: true }),
  M("p3", "prebed", 3, [["milk", 300], ["bread", 1], ["pb", 15]], { noCook: true }),
];
export const FUEL = M("f1", "fuel", 2, [["banana", 1], ["dates", 30], ["baguette", 60], ["pb", 15]], { noCook: true });
