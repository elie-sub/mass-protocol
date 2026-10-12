/** Date keys are local `YYYY-MM-DD`. Weeks are ISO weeks starting Monday. */
export type DateKey = string;

export const pad = (n: number, l = 2) => String(n).padStart(l, "0");
export const keyOf = (d: Date): DateKey => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseKey = (k: DateKey) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (k: DateKey, n: number) => {
  const d = parseKey(k);
  d.setDate(d.getDate() + n);
  return keyOf(d);
};
export const diffDays = (a: DateKey, b: DateKey) => Math.round((parseKey(b).getTime() - parseKey(a).getTime()) / 864e5);
export const todayKey = () => keyOf(new Date());
/** 0 = Monday … 6 = Sunday */
export const isoDow = (k: DateKey) => (parseKey(k).getDay() + 6) % 7;
export const weekStartOf = (k: DateKey) => addDays(k, -isoDow(k));
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
export const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
