import { apiFetch, CACHE_TTL, InMemoryCache, TokenBucket } from "@belgium-gov-mcp/core";
import type { KboEnterprise, KboSearchResponse } from "./types.js";

const BASE = "https://cbeapi.be/api";
const limiter = new TokenBucket(1, 2000);
const cache = new InMemoryCache();
const CBEAPI_KEY_REQUIRED_MESSAGE =
  "CBEAPI now requires an API key. Set CBEAPI_KEY or register for the free tier at https://cbeapi.be/en.";

function normalizeEnterpriseList(data: KboSearchResponse | KboEnterprise[]): KboEnterprise[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.enterprises)) return data.enterprises;
  if (Array.isArray(data.enterprise)) return data.enterprise;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

function isEnterpriseEnvelope(data: KboEnterprise | { data?: KboEnterprise }): data is { data?: KboEnterprise } {
  return typeof data === "object" && data !== null && Object.prototype.hasOwnProperty.call(data, "data");
}

function normalizeEnterprise(data: KboEnterprise | { data?: KboEnterprise }): KboEnterprise {
  if (isEnterpriseEnvelope(data)) {
    if (data.data) return data.data;
    throw new Error("CBEAPI response did not include company data");
  }
  return data;
}

function normalizeEnterpriseNumber(value: string): string {
  return value.replace(/\D/g, "");
}

function getCbeApiHeaders(): Record<string, string> {
  const apiKey = process.env.CBEAPI_KEY;
  if (!apiKey) {
    throw new Error(CBEAPI_KEY_REQUIRED_MESSAGE);
  }

  return { Authorization: `Bearer ${apiKey}` };
}

export const kboClient = {
  async searchEnterprise(query: string, type?: "name" | "number"): Promise<KboEnterprise[]> {
    const normalizedQuery = type === "number" ? normalizeEnterpriseNumber(query) : query;
    const cacheKey = `search:${type ?? "auto"}:${normalizedQuery}`;
    const cached = await cache.get<KboEnterprise[]>(cacheKey);
    if (cached) return cached;

    if (type === "number" || (!type && /^\d{8,}$/.test(normalizeEnterpriseNumber(query)))) {
      const enterprise = await this.getEnterprise(query);
      const result = [enterprise];
      await cache.set(cacheKey, result, CACHE_TTL.SEMI_STATIC);
      return result;
    }

    const data = await apiFetch<KboSearchResponse>("kbo", BASE, "/v1/company/search", {
      params: { name: normalizedQuery },
      headers: getCbeApiHeaders(),
      rateLimiter: limiter,
    });

    const result = normalizeEnterpriseList(data);
    await cache.set(cacheKey, result, CACHE_TTL.SEMI_STATIC);
    return result;
  },

  async getEnterprise(enterpriseNumber: string): Promise<KboEnterprise> {
    const normalizedNumber = normalizeEnterpriseNumber(enterpriseNumber);
    const cacheKey = `enterprise:${normalizedNumber}`;
    const cached = await cache.get<KboEnterprise>(cacheKey);
    if (cached) return cached;

    const data = await apiFetch<KboEnterprise | { data?: KboEnterprise }>("kbo", BASE, `/v1/company/${normalizedNumber}`, {
      headers: getCbeApiHeaders(),
      rateLimiter: limiter,
    });

    const result = normalizeEnterprise(data);
    await cache.set(cacheKey, result, CACHE_TTL.SEMI_STATIC);
    return result;
  },

  async searchByActivity(naceCode: string): Promise<KboEnterprise[]> {
    throw new Error(
      `CBEAPI does not expose a public company-by-NACE search endpoint in its current documentation. Activity search for ${naceCode} is not supported by this server.`
    );
  },
};
