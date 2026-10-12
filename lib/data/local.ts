import { cache, photoStore, type Repo } from "./repo";
import type { State } from "../types";

export const LOCAL_KEY = "mp:state:v1";

/** Device-only storage: used when Supabase is not configured. */
export const localRepo: Repo = {
  mode: "local",
  async load() {
    return cache.get<State>(LOCAL_KEY);
  },
  async apply(ops, next) {
    if (!cache.set(LOCAL_KEY, next)) throw new Error("Local storage is full or unavailable");
    await Promise.all(ops.photos.del.map((id) => photoStore.del(id)));
  },
  async putPhoto(id, blob) {
    await photoStore.put(id, blob);
    return `local/${id}`;
  },
  async photoUrl(id) {
    const b = await photoStore.get(id);
    return b ? URL.createObjectURL(b) : null;
  },
};
