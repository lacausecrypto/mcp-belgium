import { apiFetch, CACHE_TTL, InMemoryCache } from "@belgium-gov-mcp/core";
import type {
  WalloniaDataset,
  WalloniaDatasetListResponse,
  WalloniaRecord,
  WalloniaRecordsResponse,
} from "./types.js";

const BASE = "https://www.odwb.be/api/explore/v2.1";
const cache = new InMemoryCache();

function normalizeDatasetList(data: WalloniaDatasetListResponse): WalloniaDataset[] {
  if (Array.isArray(data.datasets)) return data.datasets;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

function normalizeRecordList(data: WalloniaRecordsResponse): WalloniaRecord[] {
  if (Array.isArray(data.records)) return data.records;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

export const walloniaClient = {
  async searchDatasets(query: string, rows = 10): Promise<WalloniaDataset[]> {
    const data = await apiFetch<WalloniaDatasetListResponse>("opendata-wallonia", BASE, "/catalog/datasets", {
      params: {
        q: query,
        limit: rows,
      },
    });

    return normalizeDatasetList(data);
  },

  async getDataset(datasetId: string): Promise<WalloniaDataset> {
    const cacheKey = `dataset:${datasetId}`;
    const cached = await cache.get<WalloniaDataset>(cacheKey);
    if (cached) return cached;

    const data = await apiFetch<WalloniaDataset>("opendata-wallonia", BASE, `/catalog/datasets/${datasetId}`);
    await cache.set(cacheKey, data, CACHE_TTL.SEMI_STATIC);
    return data;
  },

  async getRecords(datasetId: string, where?: string, limit = 20): Promise<WalloniaRecord[]> {
    const data = await apiFetch<WalloniaRecordsResponse>(
      "opendata-wallonia",
      BASE,
      `/catalog/datasets/${datasetId}/records`,
      {
        params: {
          where,
          limit,
        },
      }
    );

    return normalizeRecordList(data);
  },
};
