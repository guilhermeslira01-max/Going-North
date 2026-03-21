import NodeCache from 'node-cache';

// TTLs in seconds
export const TTL = {
  BCB: 60 * 60,        // 60 minutes
  GNEWS: 30 * 60,      // 30 minutes
  BRAPI: 10 * 60,      // 10 minutes
  COINGECKO: 10 * 60,  // 10 minutes
  AWESOME: 10 * 60,    // 10 minutes
  AI_ARTICLE: 0,       // permanent (0 = no TTL)
};

export const cache = new NodeCache({ checkperiod: 120 });

export function getCached<T>(key: string): T | undefined {
  return cache.get<T>(key);
}

export function setCached<T>(key: string, value: T, ttlSeconds: number): void {
  if (ttlSeconds === 0) {
    cache.set(key, value); // no expiry
  } else {
    cache.set(key, value, ttlSeconds);
  }
}

export function deleteCached(key: string): void {
  cache.del(key);
}

export function getCacheTimestamp(key: string): string | null {
  const ttl = cache.getTtl(key);
  if (!ttl) return null;
  // Work backwards from remaining TTL isn't reliable; store timestamps alongside
  return null;
}

// Separate timestamp store
const timestamps = new Map<string, number>();

export function setWithTimestamp<T>(key: string, value: T, ttlSeconds: number): void {
  setCached(key, value, ttlSeconds);
  timestamps.set(key, Date.now());
}

export function getTimestamp(key: string): number | null {
  return timestamps.get(key) ?? null;
}

export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
