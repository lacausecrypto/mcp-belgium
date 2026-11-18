import { apiFetch, CACHE_TTL, InMemoryCache, type FetchOptions } from "@lacausecrypto/core";
import type { ArcGisLayerQueryResult, ArcGisServiceDetails, ArcGisServiceDirectory } from "./types.js";

const BASE = "https://geoservices.wallonie.be/arcgis/rest/services";
const cache = new InMemoryCache();

interface ArcGisErrorBody {
  error?: { code?: number; message?: string; details?: unknown[] };
}

/** ArcGIS REST reports errors as HTTP 200 with an `error` object in the body. */
async function arcgisFetch<T>(path: string, opts: FetchOptions): Promise<T> {
  const data = await apiFetch<T & ArcGisErrorBody>("wallonia-geo", BASE, path, opts);
  if (data.error) {
    const details = Array.isArray(data.error.details) && data.error.details.length > 0 ? ` (${data.error.details.join("; ")})` : "";
    throw new Error(`ArcGIS error ${data.error.code ?? "?"} on ${path || "/"}: ${data.error.message ?? "unknown error"}${details}`);
  }
  return data;
}

function normalizeServicePath(servicePath: string): string {
  const trimmed = servicePath.replace(/^\/+|\/+$/g, "");
  return trimmed.endsWith("/MapServer") ? trimmed : `${trimmed}/MapServer`;
}

function encodeServicePath(servicePath: string): string {
  return servicePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export const walloniaGeoClient = {
  async listFolders(): Promise<string[]> {
    const cached = await cache.get<string[]>("folders");
    if (cached) return cached;

    const data = await arcgisFetch<ArcGisServiceDirectory>("", {
      params: { f: "pjson" },
    });
    const folders = data.folders ?? [];
    await cache.set("folders", folders, CACHE_TTL.SEMI_STATIC);
    return folders;
  },

  async listServices(folder?: string): Promise<Array<{ name: string; type: string }>> {
    const cacheKey = `services:${folder ?? "root"}`;
    const cached = await cache.get<Array<{ name: string; type: string }>>(cacheKey);
    if (cached) return cached;

    const path = folder ? `/${encodeURIComponent(folder)}` : "";
    const data = await arcgisFetch<ArcGisServiceDirectory>(path, {
      params: { f: "pjson" },
    });

    const services = data.services ?? [];
    await cache.set(cacheKey, services, CACHE_TTL.SEMI_STATIC);
    return services;
  },

  async getService(servicePath: string): Promise<ArcGisServiceDetails> {
    const normalized = encodeServicePath(normalizeServicePath(servicePath));
    const cacheKey = `service:${normalized}`;
    const cached = await cache.get<ArcGisServiceDetails>(cacheKey);
    if (cached) return cached;

    const data = await arcgisFetch<ArcGisServiceDetails>(`/${normalized}`, {
      params: { f: "pjson" },
    });
    await cache.set(cacheKey, data, CACHE_TTL.SEMI_STATIC);
    return data;
  },

  async queryLayer(
    servicePath: string,
    layerId: number,
    where = "1=1",
    outFields = "*",
    limit = 20,
    returnGeometry = false
  ): Promise<ArcGisLayerQueryResult> {
    const normalized = encodeServicePath(normalizeServicePath(servicePath));
    return arcgisFetch<ArcGisLayerQueryResult>(`/${normalized}/${layerId}/query`, {
      params: {
        where,
        outFields,
        returnGeometry,
        f: "pjson",
        resultRecordCount: limit,
      },
      timeoutMs: 20000,
    });
  },
};
