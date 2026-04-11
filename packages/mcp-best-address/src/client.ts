import { apiFetch, CACHE_TTL, InMemoryCache } from "@lacausecrypto/core";
import type {
  BestCollection,
  BestItem,
  SearchAddressParams,
  SearchMunicipalityParams,
  SearchPostalInfoParams,
  SearchStreetParams,
} from "./types.js";

const BASE = "https://best.pr.fedservices.be/api/opendata/best/v1";
const cache = new InMemoryCache();

function encodeBestId(id: string): string {
  return encodeURIComponent(id);
}

export const bestAddressClient = {
  async searchAddresses(params: SearchAddressParams): Promise<BestCollection<BestItem>> {
    const { xLong, yLat, radius = 100, crs, ...rest } = params;
    return apiFetch<BestCollection<BestItem>>("best-address", BASE, "/belgianAddress/v2/addresses", {
      params: {
        ...rest,
        ...(xLong !== undefined && yLat !== undefined
          ? {
              xLong,
              yLat,
              radius,
              crs,
            }
          : {}),
      },
    });
  },

  async getAddress(id: string): Promise<BestItem> {
    const cacheKey = `address:${id}`;
    const cached = await cache.get<BestItem>(cacheKey);
    if (cached) return cached;

    const data = await apiFetch<BestItem>(
      "best-address",
      BASE,
      `/belgianAddress/v2/addresses/${encodeBestId(id)}`
    );
    await cache.set(cacheKey, data, CACHE_TTL.SEMI_STATIC);
    return data;
  },

  async searchMunicipalities(params: SearchMunicipalityParams): Promise<BestCollection<BestItem>> {
    return apiFetch<BestCollection<BestItem>>("best-address", BASE, "/belgianAddress/v2/municipalities", {
      params: { ...params },
    });
  },

  async searchStreets(params: SearchStreetParams): Promise<BestCollection<BestItem>> {
    return apiFetch<BestCollection<BestItem>>("best-address", BASE, "/belgianAddress/v2/streets", {
      params: { ...params },
    });
  },

  async searchPostalInfos(params: SearchPostalInfoParams): Promise<BestCollection<BestItem>> {
    return apiFetch<BestCollection<BestItem>>("best-address", BASE, "/belgianAddress/v2/postalInfos", {
      params: { ...params },
    });
  },
};
