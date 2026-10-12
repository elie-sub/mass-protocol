import { defaultState, migrate } from "../metrics";
import { diffState, isEmpty } from "./diff";
import { cache, type Repo } from "./repo";
import { LOCAL_KEY } from "./local";
import type { State } from "../types";

export type SyncStatus = "ok" | "pending" | "offline";

/**
 * Offline-first sync. The app always works on an in-memory state mirrored to localStorage.
 * `synced` is the last state the server confirmed; each flush pushes diff(synced, latest).
 * Pending edits survive reloads because both snapshots are cached.
 */
export class Sync {
  private synced: State | null = null;
  /** false until the server state has been read once on this device */
  private loaded = false;
  private latest: State | null = null;
  private running = false;
  private again = false;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private retry: ReturnType<typeof setTimeout> | undefined;
  private curKey: string;
  private syncedKey: string;

  constructor(private repo: Repo, scope: string, private onStatus: (s: SyncStatus) => void, private onRemote: (s: State) => void) {
    this.curKey = `mp:cur:${scope}`;
    this.syncedKey = `mp:synced:${scope}`;
  }

  async init(): Promise<State> {
    if (this.repo.mode === "local") {
      const s = await this.repo.load();
      this.loaded = true;
      this.synced = s ? migrate(s) : null;
      this.latest = this.synced ?? defaultState();
      if (!s) this.schedule(0);
      return this.latest;
    }
    const cur = cache.get<State>(this.curKey);
    this.synced = cache.get<State>(this.syncedKey);
    this.latest = cur ? migrate(cur) : null;
    try {
      const s = await this.reconcile();
      this.onStatus("ok");
      return s;
    } catch {
      this.onStatus("offline");
      this.retryLater();
      this.latest ??= defaultState();
      return this.latest;
    }
  }

  /** Push edits made while offline, then adopt the server state. */
  private async reconcile(): Promise<State> {
    if (this.synced && this.latest) {
      const pending = diffState(this.synced, this.latest);
      if (!isEmpty(pending)) await this.repo.apply(pending, this.latest);
    }
    const remote = await this.repo.load();
    let state: State;
    if (remote) state = remote;
    else {
      // First run on this account: seed it with what this device has (including data from local-only mode).
      const local = cache.get<State>(LOCAL_KEY);
      state = this.latest ?? (local ? migrate(local) : defaultState());
      await this.repo.apply(diffState(null, state), state);
    }
    this.loaded = true;
    this.synced = state;
    this.latest = state;
    cache.set(this.syncedKey, state);
    cache.set(this.curKey, state);
    return state;
  }

  save(next: State) {
    this.latest = next;
    // Mirror to the device synchronously so a reload or app switch right after a tap never loses it.
    cache.set(this.repo.mode === "local" ? LOCAL_KEY : this.curKey, next);
    this.schedule(350);
  }

  private schedule(ms: number) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.flush(), ms);
  }

  private retryLater() {
    clearTimeout(this.retry);
    this.retry = setTimeout(() => this.flush(), 20000);
  }

  async flush() {
    if (this.running) { this.again = true; return; }
    if (!this.latest) return;
    this.running = true;
    try {
      if (!this.loaded) {
        const s = await this.reconcile();
        this.onRemote(s);
      } else {
        const target = this.latest;
        const ops = diffState(this.synced, target);
        if (!isEmpty(ops)) {
          this.onStatus("pending");
          await this.repo.apply(ops, target);
          this.synced = target;
          if (this.repo.mode === "supabase") cache.set(this.syncedKey, target);
        }
      }
      this.onStatus("ok");
    } catch {
      this.onStatus("offline");
      this.retryLater();
    } finally {
      this.running = false;
      if (this.again) { this.again = false; this.schedule(0); }
    }
  }

  dispose() {
    clearTimeout(this.timer);
    clearTimeout(this.retry);
  }
}
