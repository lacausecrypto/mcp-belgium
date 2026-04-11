import { apiFetch, CACHE_TTL, InMemoryCache } from "@belgium-gov-mcp/core";
import type {
  BrusselsDataset,
  BrusselsDatasetListResponse,
  BrusselsRecord,
  BrusselsRecordsResponse,
} from "./types.js";

const BASE = "https://opendata.brussels.be/api/explore/v2.1";
const cache = new InMemoryCache();

function normalizeDatasetList(data: BrusselsDatasetListResponse): BrusselsDataset[] {
  if (Array.isArray(data.datasets)) return data.datasets;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

function normalizeRecordList(data: BrusselsRecordsResponse): BrusselsRecord[] {
  if (Array.isArray(data.records)) return data.records;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

export const brusselsClient = {
  async searchDatasets(query: string, rows = 10): Promise<BrusselsDataset[]> {
    const data = await apiFetch<BrusselsDatasetListResponse>("opendata-brussels", BASE, "/catalog/datasets", {
      params: {
        q: query,
        limit: rows,
      },
    });

    return normalizeDatasetList(data);
  },

  async getDataset(datasetId: string): Promise<BrusselsDataset> {
    const cacheKey = `dataset:${datasetId}`;
    const cached = await cache.get<BrusselsDataset>(cacheKey);
    if (cached) return cached;

    const data = await apiFetch<BrusselsDataset>("opendata-brussels", BASE, `/catalog/datasets/${datasetId}`);
    await cache.set(cacheKey, data, CACHE_TTL.SEMI_STATIC);
    return data;
  },

  async getRecords(datasetId: string, where?: string, limit = 20): Promise<BrusselsRecord[]> {
    const data = await apiFetch<BrusselsRecordsResponse>(
      "opendata-brussels",
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
