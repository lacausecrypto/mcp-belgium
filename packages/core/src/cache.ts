interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class InMemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

/**
 * Cache TTL constants in seconds.
 * Use these consistently across all servers.
 */
export const CACHE_TTL = {
  /** Station lists, stop lists, organizations — changes rarely */
  STATIC: 86400,
  /** Dataset metadata, company info — changes occasionally */
  SEMI_STATIC: 3600,
  /** Timetables, schedules — changes frequently */
  DYNAMIC: 120,
  /** Real-time departures, waiting times — changes constantly */
  REAL_TIME: 30,
  /** Live sensor data — no cache */
  LIVE: 0,
} as const;
