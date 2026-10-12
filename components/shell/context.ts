"use client";

import { createContext, useContext } from "react";
import type { Metrics } from "@/lib/metrics";
import type { I18n } from "@/lib/i18n";
import type { Repo } from "@/lib/data/repo";
import type { SyncStatus } from "@/lib/data/sync";
import type { State } from "@/lib/types";
import type { Actions } from "./actions";

export type Tab = "today" | "calendar" | "training" | "nutrition" | "progress" | "profile" | "groceries";
export const TAB_PATH: Record<Tab, string> = {
  today: "/", calendar: "/calendar", training: "/training", nutrition: "/nutrition", progress: "/progress", profile: "/profile", groceries: "/groceries",
};

export type SheetState =
  | { type: "recipe"; key: string; slot: string }
  | { type: "weigh"; key: string }
  | { type: "activity"; key: string; preset?: string }
  | { type: "checkin"; key: string }
  | { type: "day"; key: string }
  | { type: "review"; ws: string };

type OpenFn = <T extends SheetState["type"]>(type: T, params: Omit<Extract<SheetState, { type: T }>, "type">) => void;

export interface AppCtx extends I18n {
  state: State;
  metrics: Metrics;
  update: (fn: (d: State) => void) => void;
  replace: (s: State) => void;
  actions: Actions;
  open: OpenFn;
  close: () => void;
  toast: (msg: string, kind?: "err" | "ach") => void;
  setTab: (t: Tab) => void;
  repo: Repo;
  sync: SyncStatus;
  signOut: (() => void) | null;
}

export const Ctx = createContext<AppCtx | null>(null);
export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp outside provider");
  return c;
}
