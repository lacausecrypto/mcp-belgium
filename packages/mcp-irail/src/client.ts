import { apiFetch, TokenBucket, InMemoryCache, CACHE_TTL } from "@belgium-gov-mcp/core";
import type {
  Connection,
  ConnectionsResponse,
  DisturbanceItem,
  DisturbancesResponse,
  IrailStation,
  LiveboardResponse,
  StationsResponse,
  VehicleResponse,
} from "./types.js";

const BASE = "https://api.irail.be";
const limiter = new TokenBucket(3, 350);
const cache = new InMemoryCache();

export const irailClient = {
  async getStations(): Promise<IrailStation[]> {
    const cached = await cache.get<IrailStation[]>("stations");
    if (cached) return cached;
    const data = await apiFetch<StationsResponse>("irail", BASE, "/stations", {
      params: { format: "json", lang: "en" },
      rateLimiter: limiter,
    });
    await cache.set("stations", data.station, CACHE_TTL.STATIC);
    return data.station;
  },

  async searchStations(query: string): Promise<IrailStation[]> {
    const all = await this.getStations();
    const q = query.toLowerCase();
    return all.filter((s) => s.name.toLowerCase().includes(q) || s.standardname.toLowerCase().includes(q));
  },

  async getConnections(from: string, to: string, datetime?: string, timeSel?: string): Promise<Connection[]> {
    const params: Record<string, string> = { format: "json", from, to, lang: "en" };
    if (datetime) params.date = datetime.split("T")[0]?.replace(/-/g, "") ?? "";
    if (datetime) params.time = datetime.split("T")[1]?.substring(0, 5)?.replace(":", "") ?? "";
    if (timeSel) params.timesel = timeSel;
    const data = await apiFetch<ConnectionsResponse>("irail", BASE, "/connections", {
      params,
      rateLimiter: limiter,
    });
    return data.connection ?? [];
  },

  async getLiveboard(station: string, arrivals?: boolean): Promise<LiveboardResponse> {
    const data = await apiFetch<LiveboardResponse>("irail", BASE, "/liveboard", {
      params: { format: "json", station, arrdep: arrivals ? "arrival" : "departure", lang: "en" },
      rateLimiter: limiter,
    });
    return data;
  },

  async getVehicle(vehicleId: string): Promise<VehicleResponse> {
    const data = await apiFetch<VehicleResponse>("irail", BASE, "/vehicle", {
      params: { format: "json", id: vehicleId, lang: "en" },
      rateLimiter: limiter,
    });
    return data;
  },

  async getDisturbances(): Promise<DisturbanceItem[]> {
    const cached = await cache.get<DisturbanceItem[]>("disturbances");
    if (cached) return cached;
    const data = await apiFetch<DisturbancesResponse>("irail", BASE, "/disturbances", {
      params: { format: "json", lang: "en" },
      rateLimiter: limiter,
    });
    const result = data.disturbance ?? [];
    await cache.set("disturbances", result, CACHE_TTL.DYNAMIC);
    return result;
  },
};
