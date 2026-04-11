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
  return [];
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

function latestPoint(points: AirQualityDataPoint[]): AirQualityDataPoint | null {
  return points.length > 0 ? points[points.length - 1] ?? null : null;
}

function getLast24Hours(): { from: string; to: string } {
  const to = new Date();
  const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

function timeseriesLabel(ts: AirQualityTimeseries): string {
  return JSON.stringify(ts).toLowerCase();
}

export const airQualityClient = {
  async searchStations(latitude: number, longitude: number, radius = 10000): Promise<AirQualityStation[]> {
    const data = await apiFetch<AirQualityStationsResponse>("air-quality", BASE, "/stations", {
      params: { near: buildNearParam(latitude, longitude, radius) },
    });

    return normalizeStations(data);
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
    const stations = await this.searchStations(latitude, longitude, 10000);
    const station = stations[0];

    if (!station) {
      throw new Error("No nearby air quality station found");
    }

    const stationId =
      typeof station.id === "number"
        ? station.id
        : typeof station.id === "string"
          ? parseInt(station.id, 10)
          : NaN;

    if (Number.isNaN(stationId)) {
      throw new Error("Nearby station does not expose a numeric station ID");
    }

    const series = await this.getTimeseriesForStation(stationId);
    const belaqiSeries = series.find((item) => {
      const label = timeseriesLabel(item);
      return label.includes("belaqi") || label.includes("aqi");
    });

    if (!belaqiSeries) {
      throw new Error("BelAQI timeseries not found for the nearest station");
    }

    const timeseriesId =
      typeof belaqiSeries.id === "number"
        ? belaqiSeries.id
        : typeof belaqiSeries.id === "string"
          ? parseInt(belaqiSeries.id, 10)
          : NaN;

    if (Number.isNaN(timeseriesId)) {
      throw new Error("BelAQI timeseries does not expose a numeric timeseries ID");
    }

    const { from, to } = getLast24Hours();
    const points = await this.getTimeseriesData(timeseriesId, from, to);

    return {
      station,
      timeseries: belaqiSeries,
      latest: latestPoint(points),
    };
  },
};
