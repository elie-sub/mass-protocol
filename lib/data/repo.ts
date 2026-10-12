import type { Ops } from "./diff";
import type { State } from "../types";

/** The only persistence boundary. Engines and UI never talk to storage directly. */
export interface Repo {
  mode: "local" | "supabase";
  /** Remote state, or null when nothing has been saved yet. Throws when unreachable. */
  load(): Promise<State | null>;
  /** Push a row-level diff. `next` is the full state the ops lead to. Throws on failure. */
  apply(ops: Ops, next: State): Promise<void>;
  putPhoto(id: string, blob: Blob): Promise<string>;
  photoUrl(id: string, path?: string): Promise<string | null>;
}

/* ---------- browser helpers shared by both repos ---------- */

export const cache = {
  get<T>(k: string): T | null {
    try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : null; } catch { return null; }
  },
  set(k: string, v: unknown) {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; }
  },
  del(k: string) {
    try { localStorage.removeItem(k); } catch { /* ignore */ }
  },
};

const DB = "mp-photos";
function idb(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore("p");
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
/** Local photo blobs: the whole store in local mode, an offline cache in Supabase mode. */
export const photoStore = {
  async get(id: string): Promise<Blob | null> {
    try {
      const db = await idb();
      return await new Promise((res) => { const q = db.transaction("p").objectStore("p").get(id); q.onsuccess = () => res(q.result ?? null); q.onerror = () => res(null); });
    } catch { return null; }
  },
  async put(id: string, blob: Blob) {
    const db = await idb();
    await new Promise<void>((res, rej) => { const tx = db.transaction("p", "readwrite"); tx.objectStore("p").put(blob, id); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
  },
  async del(id: string) {
    try {
      const db = await idb();
      await new Promise<void>((res) => { const tx = db.transaction("p", "readwrite"); tx.objectStore("p").delete(id); tx.oncomplete = () => res(); tx.onerror = () => res(); });
    } catch { /* ignore */ }
  },
};
