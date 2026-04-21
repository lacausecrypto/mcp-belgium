import { apiFetch, CACHE_TTL, InMemoryCache, optionalEnv } from "@lacausecrypto/core";
import type { StibRecord, StibRecordsResponse } from "./types.js";

const BASE = "https://data.stib-mivb.brussels/api/v2";
const cache = new InMemoryCache();

function normalizeRecords(data: StibRecordsResponse): StibRecord[] {
  if (Array.isArray(data.records)) return data.records;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

export function escapeOdsString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function getHeaders(): Record<string, string> {
  const apiKey = optionalEnv("STIB_API_KEY", "");
  if (!apiKey) {
    throw new Error("STIB_API_KEY not configured. Get a free key at https://data.stib-mivb.brussels");
  }

  return { Authorization: `apikey ${apiKey}` };
}

export const stibClient = {
  async getWaitingTimes(stopName: string): Promise<StibRecord[]> {
    const data = await apiFetch<StibRecordsResponse>(
      "stib",
      BASE,
      "/catalog/datasets/waiting-time-rt-production/records",
      {
        headers: getHeaders(),
        params: {
          where: `search(stop_name, "${escapeOdsString(stopName)}") OR search(pointid, "${escapeOdsString(stopName)}")`,
        },
      }
    );

    return normalizeRecords(data);
  },

  async searchStops(query: string): Promise<StibRecord[]> {
    const cacheKey = `stops:${query}`;
    const cached = await cache.get<StibRecord[]>(cacheKey);
    if (cached) return cached;

    const data = await apiFetch<StibRecordsResponse>(
      "stib",
      BASE,
      "/catalog/datasets/stib-stops-production/records",
      {
        headers: getHeaders(),
        params: {
          where: `search(stop_name, "${escapeOdsString(query)}")`,
        },
      }
    );

    const result = normalizeRecords(data);
    await cache.set(cacheKey, result, CACHE_TTL.SEMI_STATIC);
    return result;
  },

  async getRoute(lineId: string): Promise<StibRecord[]> {
    const cacheKey = `route:${lineId}`;
    const cached = await cache.get<StibRecord[]>(cacheKey);
    if (cached) return cached;

    const data = await apiFetch<StibRecordsResponse>(
      "stib",
      BASE,
      "/catalog/datasets/stib-lines-production/records",
      {
        headers: getHeaders(),
        params: {
          where: `search(lineid, "${escapeOdsString(lineId)}")`,
        },
      }
    );

    const result = normalizeRecords(data);
    await cache.set(cacheKey, result, CACHE_TTL.SEMI_STATIC);
    return result;
  },

  async getMessages(): Promise<StibRecord[]> {
    const cacheKey = "messages";
    const cached = await cache.get<StibRecord[]>(cacheKey);
    if (cached) return cached;

    const data = await apiFetch<StibRecordsResponse>(
      "stib",
      BASE,
      "/catalog/datasets/stib-service-messages-production/records",
      {
        headers: getHeaders(),
      }
    );

    const result = normalizeRecords(data);
    await cache.set(cacheKey, result, CACHE_TTL.DYNAMIC);
    return result;
  },
};
