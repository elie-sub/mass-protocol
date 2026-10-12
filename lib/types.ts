import type { DateKey } from "./utils/date";

export type Lang = "fr" | "en";
export type Slot = "breakfast" | "snack1" | "lunch" | "snack2" | "dinner" | "prebed";
export type Energy = "Low" | "Good" | "High";

export interface Profile {
  name: string;
  age: number;
  heightCm: number;
  startWeight: number;
  goalWeight: number;
  startDate: DateKey;
  sessionsPerWeek: "auto" | 4 | 5;
  padelDays: number[];
  activity: number;
  surplus: number;
  kcalAdjust: number;
  proteinPerKg: number;
  nutritionMode: "auto" | "manual";
  manual: { kcal: number; protein: number; carbs: number; fat: number };
  waterL: number;
  creatine: boolean;
  prefs: { noCook: boolean; noFish: boolean; noPork: boolean };
  lang: Lang;
  /** isoDow of shopping days, 0 = Monday */
  shopDays: number[];
}

export interface Extra { id: string; label: string; kcal: number; p: number; c?: number; f?: number }
export interface Checkin { energy: Energy; note: string }
export interface DayLog {
  meals?: Partial<Record<Slot | "fuel", { eaten?: boolean; swap?: string }>>;
  habits?: Record<string, boolean>;
  checkin?: Checkin;
  note?: string;
  extras?: Extra[];
  /** On a trip's first day: foods already in the cart */
  shopping?: string[];
}

export interface LoggedSet { w: number; r: number }
/** V1 stored PRs as English strings; new sessions store structured entries. */
export type PrEntry = string | { exId: string; w: number; r: number };
export interface Session {
  id: string;
  date: DateKey;
  tplId: string;
  name: string;
  startedAt: number;
  endedAt: number;
  exercises: { exId: string; name: string; sets: LoggedSet[] }[];
  sets: number;
  volume: number;
  prs: number;
  prList: PrEntry[];
}

export interface DraftSet { w: string | number; r: string | number; done: boolean }
export interface ActiveWorkout {
  date: DateKey;
  tplId: string;
  name: string;
  startedAt: number;
  idx: number;
  restEnd: number | null;
  exercises: { exId: string; reps: [number, number]; rest: number; sets: DraftSet[] }[];
}

export type ActType = "padel" | "run" | "crossfit" | "other";
export type Intensity = "low" | "medium" | "high";
export interface Activity { id: string; date: DateKey; type: ActType; duration: number; intensity: Intensity }

export type MeasKey = "chest" | "waist" | "arms" | "thighs" | "shoulders";
export type Measurement = { id: string; date: DateKey } & Partial<Record<MeasKey, number>>;

export type Pose = "front" | "side" | "back";
export interface Photo { id: string; date: DateKey; pose: Pose; path?: string }

export interface ReviewAnswers { hunger: string; energy: string; recovery: string; workouts: string; notes: string }
export interface WeeklyCheckin {
  answers: ReviewAnswers;
  stats: Record<string, unknown> & { avgScore: number };
  suggestion: string;
  suggestionCode?: string;
  applied?: boolean;
  submittedAt?: number;
}

export interface State {
  v: number;
  profile: Profile;
  days: Record<DateKey, DayLog>;
  weights: Record<DateKey, number>;
  sessions: Session[];
  active: ActiveWorkout | null;
  activities: Activity[];
  measurements: Measurement[];
  photos: Photo[];
  checkins: Record<DateKey, WeeklyCheckin>;
  seenAch: string[];
}
