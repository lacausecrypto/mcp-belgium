import { apiFetch } from "@lacausecrypto/core";
import type {
  AirQualityDataPoint,
  AirQualityDataResponse,
  AirQualityStation,
  AirQualityStationsResponse,
  AirQualityTimeseries,
  AirQualityTimeseriesResponse,
} from "./types.js";

const BASE = "https://geo.irceline.be/sos/api/v1";
const WMS = "https://geo.irceline.be";
/** Hourly RIO-IFDM interpolated BelAQI raster (1 = excellent … 10 = horrible). */
const BELAQI_LAYER = "rioifdm:belaqi";
const BELAQI_LABELS = [
  "Excellent",
  "Very good",
  "Good",
  "Fairly good",
  "Moderate",
  "Poor",
  "Very poor",
  "Bad",
  "Very bad",
  "Horrible",
] as const;

interface WmsFeatureInfo {
  features: Array<{ properties: Record<string, unknown> }>;
}

function stationCoordinates(station: AirQualityStation): [number, number] | null {
  const geometry = station.geometry as { coordinates?: unknown } | undefined;
  const coords = geometry?.coordinates;
  if (Array.isArray(coords) && typeof coords[0] === "number" && typeof coords[1] === "number") {
    return [coords[0], coords[1]];
  }
  return null;
}

/** Haversine distance in km. */
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

function buildNearParam(latitude: number, longitude: number, radiusMeters: number): string {
  return JSON.stringify({
    center: {
      type: "Point",
      coordinates: [longitude, latitude],
    },
    radius: radiusMeters / 1000,
  });
}

function normalizeStations(data: AirQualityStationsResponse | AirQualityStation[]): AirQualityStation[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.stations)) return data.stations;
  if (Array.isArray(data.results)) return data.results;
  throw new Error("Unexpected IRCELINE stations response shape");
}

function normalizeTimeseries(data: AirQualityTimeseriesResponse | AirQualityTimeseries[]): AirQualityTimeseries[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.timeseries)) return data.timeseries;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

function normalizeDataPoints(data: AirQualityDataResponse | AirQualityDataPoint[]): AirQualityDataPoint[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.values)) return data.values;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

/** Last point carrying a value: the current hour is often published as null until validated. */
function latestPoint(points: AirQualityDataPoint[]): AirQualityDataPoint | null {
  for (let i = points.length - 1; i >= 0; i--) {
    const point = points[i];
    const value = Array.isArray(point) ? point[1] : point.value;
    if (value !== null && value !== undefined) return point;
  }
  return null;
}

function getLast24Hours(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export const airQualityClient = {
  async searchStations(latitude: number, longitude: number, radius = 10000): Promise<AirQualityStation[]> {
    const data = await apiFetch<AirQualityStationsResponse>("air-quality", BASE, "/stations", {
      params: { near: buildNearParam(latitude, longitude, radius) },
    });

    // The API returns stations alphabetically; callers expect nearest first.
    return normalizeStations(data)
      .map((station) => {
        const coords = stationCoordinates(station);
        const distance = coords ? distanceKm(latitude, longitude, coords[1], coords[0]) : null;
        return { ...station, distanceKm: distance === null ? null : Math.round(distance * 100) / 100 };
      })
      .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  },

  async getStation(stationId: number): Promise<AirQualityStation> {
    return apiFetch<AirQualityStation>("air-quality", BASE, `/stations/${stationId}`);
  },

  async getTimeseriesForStation(stationId: number): Promise<AirQualityTimeseries[]> {
    const data = await apiFetch<AirQualityTimeseriesResponse>("air-quality", BASE, "/timeseries", {
      params: { station: stationId },
    });

    return normalizeTimeseries(data);
  },

  async getTimeseriesData(timeseriesId: number, from: string, to: string): Promise<AirQualityDataPoint[]> {
    const data = await apiFetch<AirQualityDataResponse>(
      "air-quality",
      BASE,
      `/timeseries/${timeseriesId}/getData`,
      {
        params: { timespan: `${from}/${to}` },
      }
    );

    return normalizeDataPoints(data);
  },

  async getCurrent(stationId: number): Promise<Record<string, unknown>> {
    const [station, timeseries] = await Promise.all([
      this.getStation(stationId),
      this.getTimeseriesForStation(stationId),
    ]);

    const { from, to } = getLast24Hours();
    const measurements = await Promise.all(
      timeseries.slice(0, 10).map(async (series) => {
        const id =
          typeof series.id === "number"
            ? series.id
            : typeof series.id === "string"
              ? parseInt(series.id, 10)
              : NaN;

        if (Number.isNaN(id)) {
          return { timeseries: series, latest: null };
        }

        const points = await this.getTimeseriesData(id, from, to);
        return {
          timeseries: series,
          latest: latestPoint(points),
        };
      })
    );

    return { station, measurements };
  },

  async getBelaqi(latitude: number, longitude: number): Promise<Record<string, unknown>> {
    const d = 0.001;
    const info = await apiFetch<WmsFeatureInfo>("air-quality", WMS, "/wms", {
      params: {
        service: "WMS",
        version: "1.3.0",
        request: "GetFeatureInfo",
        layers: BELAQI_LAYER,
        query_layers: BELAQI_LAYER,
        styles: "",
        crs: "EPSG:4326",
        bbox: `${latitude - d},${longitude - d},${latitude + d},${longitude + d}`,
        width: 3,
        height: 3,
        i: 1,
        j: 1,
        info_format: "application/json",
      },
    });

    const raw = info.features?.[0]?.properties?.GRAY_INDEX;
    if (typeof raw !== "number") {
      throw new Error(`No BelAQI value at ${latitude},${longitude}: the point is probably outside Belgium`);
    }
    const index = Math.round(raw);
    const label = BELAQI_LABELS[index - 1];
    if (label === undefined) {
      throw new Error(`IRCELINE returned an out-of-range BelAQI value: ${raw}`);
    }

    const nearest = (await this.searchStations(latitude, longitude, 20000))[0] ?? null;
    return {
      latitude,
      longitude,
      belaqi: index,
      label,
      scale: "1 (excellent) to 10 (horrible)",
      source: "IRCELINE RIO-IFDM hourly interpolation (latest hour)",
      nearestStation: nearest
        ? { id: (nearest.properties as { id?: unknown } | undefined)?.id ?? null, label: (nearest.properties as { label?: unknown } | undefined)?.label ?? null, distanceKm: nearest.distanceKm }
        : null,
    };
  },
};
