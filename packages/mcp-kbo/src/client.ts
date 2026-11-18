import { apiFetch, CACHE_TTL, InMemoryCache, TokenBucket } from "@lacausecrypto/core";
import type {
  KboActivitySearchResult,
  KboEnterprise,
  KboPaginatedResponse,
  KboSearchResponse,
  NaceVersion,
} from "./types.js";

const BASE = "https://cbeapi.be/api";
const limiter = new TokenBucket(1, 2000);
const cache = new InMemoryCache();
const CBEAPI_KEY_REQUIRED_MESSAGE =
  'CBEAPI requires an API key (free tier: 2,500 calls/day at https://cbeapi.be). Add it to the "env" block of this server in your MCP client config, e.g. "env": { "CBEAPI_KEY": "<your key>" }, then restart the client.';

function normalizeEnterpriseList(data: KboSearchResponse | KboEnterprise[]): KboEnterprise[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.enterprises)) return data.enterprises;
  if (Array.isArray(data.enterprise)) return data.enterprise;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.data)) return data.data;
  throw new Error(`Unexpected CBEAPI search response shape (keys: ${Object.keys(data).join(", ") || "none"})`);
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
  async searchEnterprise(query: string, type?: "name" | "number", postCode?: number): Promise<KboEnterprise[]> {
    const normalizedQuery = type === "number" ? normalizeEnterpriseNumber(query) : query;
    const cacheKey = `search:${type ?? "auto"}:${normalizedQuery}:${postCode ?? ""}`;
    const cached = await cache.get<KboEnterprise[]>(cacheKey);
    if (cached) return cached;

    if (type === "number" || (!type && /^\d{8,}$/.test(normalizeEnterpriseNumber(query)))) {
      const enterprise = await this.getEnterprise(query);
      const result = [enterprise];
      await cache.set(cacheKey, result, CACHE_TTL.SEMI_STATIC);
      return result;
    }

    const data = await apiFetch<KboSearchResponse>("kbo", BASE, "/v1/company/search", {
      params: { name: normalizedQuery, post_code: postCode },
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

  async searchByActivity(naceCode: string, naceVersion: NaceVersion = "2008", page = 1): Promise<KboActivitySearchResult> {
    const code = naceCode.replace(/\D/g, "");
    if (code.length < 2) {
      throw new Error(`Invalid NACE code "${naceCode}": expected at least 2 digits, e.g. 62 or 62.010`);
    }
    const cacheKey = `nace:${naceVersion}:${code}:${page}`;
    const cached = await cache.get<KboActivitySearchResult>(cacheKey);
    if (cached) return cached;

    const data = await apiFetch<KboPaginatedResponse>("kbo", BASE, `/v1/nace/${code}/companies`, {
      params: { nace_version: naceVersion, page },
      headers: getCbeApiHeaders(),
      rateLimiter: limiter,
    });
    if (!Array.isArray(data.data)) {
      throw new Error("CBEAPI NACE response did not include a company list");
    }

    const result: KboActivitySearchResult = {
      naceCode: code,
      naceVersion,
      page: data.meta?.current_page ?? page,
      lastPage: data.meta?.last_page ?? null,
      total: data.meta?.total ?? null,
      companies: data.data,
    };
    await cache.set(cacheKey, result, CACHE_TTL.SEMI_STATIC);
    return result;
  },
};
