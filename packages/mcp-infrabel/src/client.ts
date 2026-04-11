import { apiFetch, CACHE_TTL, InMemoryCache } from "@lacausecrypto/core";
import type {
  InfrabelDataset,
  InfrabelDatasetListResponse,
  InfrabelRecord,
  InfrabelRecordsResponse,
} from "./types.js";

const BASE = "https://opendata.infrabel.be/api/explore/v2.1";
const cache = new InMemoryCache();

function normalizeDatasets(data: InfrabelDatasetListResponse): InfrabelDataset[] {
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.datasets)) return data.datasets;
  return [];
}

function normalizeRecords(data: InfrabelRecordsResponse): InfrabelRecord[] {
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.records)) return data.records;
  return [];
}

export const infrabelClient = {
  async searchDatasets(query: string, rows = 10): Promise<InfrabelDataset[]> {
    const data = await apiFetch<InfrabelDatasetListResponse>("infrabel", BASE, "/catalog/datasets", {
      params: {
        q: query,
        limit: rows,
      },
    });

    return normalizeDatasets(data);
  },

  async getDataset(datasetId: string): Promise<InfrabelDataset> {
    const cacheKey = `dataset:${datasetId}`;
    const cached = await cache.get<InfrabelDataset>(cacheKey);
    if (cached) return cached;

    const data = await apiFetch<InfrabelDataset>(
      "infrabel",
      BASE,
      `/catalog/datasets/${encodeURIComponent(datasetId)}`
    );
    await cache.set(cacheKey, data, CACHE_TTL.SEMI_STATIC);
    return data;
  },

  async getRecords(datasetId: string, where?: string, limit = 20): Promise<InfrabelRecord[]> {
    const data = await apiFetch<InfrabelRecordsResponse>(
      "infrabel",
      BASE,
      `/catalog/datasets/${encodeURIComponent(datasetId)}/records`,
      {
        params: {
          where,
          limit,
        },
      }
    );

    return normalizeRecords(data);
  },
};
