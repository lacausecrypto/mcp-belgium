import {
  apiFetch,
  apiFetchText,
  CACHE_TTL,
  InMemoryCache,
  parseWfsFeatureTypes,
  parseXsdElements,
} from "@lacausecrypto/core";
import type { FeatureTypeDescription, GeoJsonFeatureCollection, KmiFeatureType } from "./types.js";

const BASE = "https://opendata.meteo.be/geoserver/wfs";
const cache = new InMemoryCache();

async function getCapabilitiesXml(): Promise<string> {
  const cacheKey = "capabilities";
  const cached = await cache.get<string>(cacheKey);
  if (cached) return cached;

  const xml = await apiFetchText("kmi", BASE, "", {
    params: {
      service: "WFS",
      request: "GetCapabilities",
    },
  });

  await cache.set(cacheKey, xml, CACHE_TTL.SEMI_STATIC);
  return xml;
}

export const kmiClient = {
  async listFeatureTypes(query?: string, limit = 25): Promise<KmiFeatureType[]> {
    const xml = await getCapabilitiesXml();
    const all = parseWfsFeatureTypes(xml);
    const normalizedQuery = query?.toLowerCase();
    const filtered = normalizedQuery
      ? all.filter((item) => {
          const haystack = `${item.name} ${item.title ?? ""} ${item.abstract ?? ""}`.toLowerCase();
          return haystack.includes(normalizedQuery);
        })
      : all;

    return filtered.slice(0, limit);
  },

  async describeFeatureType(typeName: string): Promise<FeatureTypeDescription> {
    const cacheKey = `describe:${typeName}`;
    const cached = await cache.get<FeatureTypeDescription>(cacheKey);
    if (cached) return cached;

    const xml = await apiFetchText("kmi", BASE, "", {
      params: {
        service: "WFS",
        version: "2.0.0",
        request: "DescribeFeatureType",
        typeNames: typeName,
      },
    });

    const description = {
      typeName,
      fields: parseXsdElements(xml),
    };
    await cache.set(cacheKey, description, CACHE_TTL.SEMI_STATIC);
    return description;
  },

  async getFeatures(
    typeName: string,
    count = 10,
    cqlFilter?: string,
    bbox?: string
  ): Promise<GeoJsonFeatureCollection> {
    return apiFetch<GeoJsonFeatureCollection>("kmi", BASE, "", {
      params: {
        service: "WFS",
        version: "2.0.0",
        request: "GetFeature",
        typeNames: typeName,
        outputFormat: "application/json",
        count,
        CQL_FILTER: cqlFilter,
        bbox,
      },
      timeoutMs: 20000,
    });
  },

  async getStations(count = 10): Promise<GeoJsonFeatureCollection> {
    return this.getFeatures("aws:aws_station", count);
  },

  async getHourlyObservations(count = 10, stationCode?: number): Promise<GeoJsonFeatureCollection> {
    const cqlFilter = stationCode !== undefined ? `code=${stationCode}` : undefined;
    return this.getFeatures("aws:aws_1hour", count, cqlFilter);
  },
};
