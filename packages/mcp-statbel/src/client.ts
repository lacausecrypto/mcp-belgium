import { apiFetch, CACHE_TTL, InMemoryCache } from "@belgium-gov-mcp/core";
import type { StatbelResult, StatbelView, StatbelViewsResponse } from "./types.js";

const BASE = "https://bestat.statbel.fgov.be/bestat/api/views";
const cache = new InMemoryCache();

function normalizeViews(data: StatbelViewsResponse | StatbelView[]): StatbelView[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.views)) return data.views;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

function extractRows(result: StatbelResult): Record<string, unknown>[] | null {
  const candidates = ["rows", "data", "results", "records", "value"];

  for (const key of candidates) {
    const value = result[key];
    if (Array.isArray(value)) {
      return value.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null);
    }
  }

  return null;
}

function filterRows(
  rows: Record<string, unknown>[],
  filters: { year?: number; region?: string }
): Record<string, unknown>[] {
  return rows.filter((row) => {
    const entries = Object.entries(row).map(([key, value]) => [key.toLowerCase(), String(value).toLowerCase()] as const);
    const yearMatch =
      filters.year === undefined ||
      entries.some(([key, value]) => (key.includes("year") || key === "time" || key.includes("period")) && value === String(filters.year));

    const regionMatch =
      !filters.region ||
      entries.some(([key, value]) => (key.includes("region") || key.includes("geo") || key.includes("territ")) && value.includes(filters.region!.toLowerCase()));

    return yearMatch && regionMatch;
  });
}

function resolveViewId(view: StatbelView): string | null {
  const candidates = [view.id, view.viewId, view.identifier];
  const match = candidates.find((item) => typeof item === "string" && item.length > 0);
  return (match as string | undefined) ?? null;
}

async function searchViews(query: string): Promise<StatbelView[]> {
  const data = await apiFetch<StatbelViewsResponse>("statbel", BASE, "", {
    params: { q: query, l: "en" },
  });

  return normalizeViews(data);
}

async function getViewResult(viewId: string): Promise<StatbelResult> {
  return apiFetch<StatbelResult>("statbel", BASE, `/${viewId}/result`, {
    params: { l: "en" },
  });
}

async function getFirstDatasetResult(
  query: string,
  filters: { year?: number; region?: string } = {}
): Promise<Record<string, unknown>> {
  const views = await searchViews(query);
  const dataset = views[0];

  if (!dataset) {
    throw new Error(`No Statbel dataset found for query: ${query}`);
  }

  const viewId = resolveViewId(dataset);
  if (!viewId) {
    throw new Error("Statbel dataset does not expose a usable view identifier");
  }

  const result = await getViewResult(viewId);
  const rows = extractRows(result);

  return {
    dataset,
    result,
    filteredRows: rows ? filterRows(rows, filters) : null,
  };
}

export const statbelClient = {
  async searchDatasets(query: string): Promise<StatbelView[]> {
    return searchViews(query);
  },

  async getPopulation(year?: number, region?: string): Promise<Record<string, unknown>> {
    return getFirstDatasetResult("population", { year, region });
  },

  async getCpi(year?: number): Promise<Record<string, unknown>> {
    return getFirstDatasetResult("consumer price index", { year });
  },

  async getEmployment(year?: number): Promise<Record<string, unknown>> {
    return getFirstDatasetResult("employment", { year });
  },

  async getViewResultCached(viewId: string): Promise<StatbelResult> {
    const cacheKey = `view:${viewId}`;
    const cached = await cache.get<StatbelResult>(cacheKey);
    if (cached) return cached;

    const result = await getViewResult(viewId);
    await cache.set(cacheKey, result, CACHE_TTL.SEMI_STATIC);
    return result;
  },
};
