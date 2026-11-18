import { apiFetch, TokenBucket } from "@lacausecrypto/core";
import type {
  MobilityFeed,
  MobilityOperator,
  MobilityTripPlan,
  ResolvedPlace,
  TransitousLeg,
  TransitousPlace,
  TransitousPlanResponse,
  TripLeg,
} from "./types.js";

/**
 * Trip planning uses Transitous (https://transitous.org), the community-run MOTIS
 * instance fed with the SNCB, STIB, De Lijn and TEC GTFS feeds. The former SMOP
 * OpenTripPlanner host (belgianmobility.io) no longer resolves.
 */
const TRANSITOUS = "https://api.transitous.org/api";
const USER_AGENT = "mcp-belgium (+https://github.com/lacausecrypto/mcp-belgium)";
const TZ = "Europe/Brussels";
const limiter = new TokenBucket(2, 1000);

const LOCAL_DATETIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(:[0-5][0-9])?$/;

const localFormat = new Intl.DateTimeFormat("sv-SE", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/** UTC ISO → "YYYY-MM-DD HH:MM" in Brussels time. */
function toLocal(iso: string): string {
  return localFormat.format(new Date(iso));
}

function brusselsOffsetMinutes(utcMs: number): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(new Date(utcMs))
      .map((p) => [p.type, p.value])
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return Math.round((asUtc - utcMs) / 60000);
}

/**
 * Datetime without offset is Brussels wall-clock time; with an offset/Z it is taken as-is.
 * Exported for tests.
 */
export function toUtcIso(datetime: string): string {
  const m = LOCAL_DATETIME.exec(datetime);
  if (!m) {
    const parsed = new Date(datetime);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error(`Invalid datetime "${datetime}": use ISO format, e.g. 2026-04-11T14:30`);
    }
    return parsed.toISOString();
  }
  const naiveUtc = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], m[6] ? +m[6].slice(1) : 0);
  const offset = brusselsOffsetMinutes(naiveUtc - brusselsOffsetMinutes(naiveUtc) * 60000);
  return new Date(naiveUtc - offset * 60000).toISOString();
}

/** "50.85,4.35" → [50.85, 4.35]; anything else → null. */
function parseCoordinates(text: string): [number, number] | null {
  const parts = text.split(",").map((p) => p.trim());
  if (parts.length !== 2 || parts.some((p) => p === "")) return null;
  const [lat, lon] = parts.map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return [lat, lon];
}

async function resolvePlace(query: string): Promise<ResolvedPlace> {
  const coords = parseCoordinates(query);
  if (coords) {
    return { query, name: query.trim(), lat: coords[0], lon: coords[1] };
  }
  const results = await apiFetch<TransitousPlace[]>("mobility", TRANSITOUS, "/v1/geocode", {
    params: { text: query },
    headers: { "User-Agent": USER_AGENT },
    rateLimiter: limiter,
    timeoutMs: 15000,
  });
  const place = results.find((r) => r.country === undefined || r.country === "BE") ?? results[0];
  if (!place) {
    throw new Error(`No place found for "${query}". Try a station name, an address or "lat,lon".`);
  }
  return { query, name: place.name, lat: place.lat, lon: place.lon };
}

/** Transitous names the trip endpoints START/END; show the resolved places instead. */
function toLeg(leg: TransitousLeg, origin: ResolvedPlace, destination: ResolvedPlace): TripLeg {
  return {
    mode: leg.mode,
    from: leg.from.name === "START" ? origin.name : leg.from.name,
    to: leg.to.name === "END" ? destination.name : leg.to.name,
    departure: toLocal(leg.startTime),
    arrival: toLocal(leg.endTime),
    line: leg.displayName ?? leg.routeShortName ?? null,
    operator: leg.agencyName ?? null,
    headsign: leg.headsign ?? null,
    realTime: leg.realTime ?? false,
    cancelled: leg.cancelled ?? false,
  };
}

export const mobilityClient = {
  async planTrip(from: string, to: string, datetime?: string, arriveBy = false): Promise<MobilityTripPlan> {
    const time = datetime ? toUtcIso(datetime) : new Date().toISOString();
    const [origin, destination] = await Promise.all([resolvePlace(from), resolvePlace(to)]);

    const data = await apiFetch<TransitousPlanResponse>("mobility", TRANSITOUS, "/v5/plan", {
      params: {
        fromPlace: `${origin.lat},${origin.lon}`,
        toPlace: `${destination.lat},${destination.lon}`,
        time,
        arriveBy,
      },
      headers: { "User-Agent": USER_AGENT },
      rateLimiter: limiter,
      timeoutMs: 30000,
    });
    if (!Array.isArray(data.itineraries)) {
      throw new Error("Transitous response did not include itineraries");
    }

    return {
      from: origin,
      to: destination,
      timezone: TZ,
      itineraries: data.itineraries.map((it) => ({
        departure: toLocal(it.startTime),
        arrival: toLocal(it.endTime),
        durationMinutes: Math.round(it.duration / 60),
        transfers: it.transfers,
        legs: it.legs.map((leg) => toLeg(leg, origin, destination)),
      })),
    };
  },

  async getOperators(): Promise<MobilityOperator[]> {
    return [
      {
        id: "sncb-nmbs",
        name: "SNCB-NMBS",
        mode: "rail",
        source: "https://www.belgiantrain.be/en/3rd-party-services/mobility-service-providers/public-data",
      },
      {
        id: "stib-mivb",
        name: "STIB-MIVB",
        mode: "metro-tram-bus",
        source: "https://github.com/belgianmobility/nextmoov-smop-general",
      },
      {
        id: "de-lijn",
        name: "De Lijn",
        mode: "tram-bus",
        source: "https://github.com/belgianmobility/nextmoov-smop-general",
      },
      {
        id: "tec",
        name: "TEC",
        mode: "tram-bus",
        source: "https://github.com/belgianmobility/nextmoov-smop-general",
      },
    ];
  },

  async getGtfsFeeds(): Promise<MobilityFeed[]> {
    return [
      {
        id: "irail-consolidated-gtfs",
        type: "gtfs-static",
        operator: "Belgian consolidated public transport",
        url: "https://gtfs.irail.be",
        source: "https://github.com/belgianmobility/nextmoov-smop-general",
      },
      {
        id: "delijn-gtfs-rt",
        type: "gtfs-rt",
        operator: "De Lijn",
        url: "https://data.delijn.be/docs/services/",
        source: "https://github.com/belgianmobility/nextmoov-smop-general",
      },
      {
        id: "sncb-nmbs-public-data",
        type: "gtfs-rt",
        operator: "SNCB-NMBS",
        url: "https://www.belgiantrain.be/en/3rd-party-services/mobility-service-providers/public-data",
        source: "https://www.belgiantrain.be/en/3rd-party-services/mobility-service-providers/public-data",
      },
      {
        id: "stib-mivb-open-data",
        type: "gtfs-rt",
        operator: "STIB-MIVB",
        url: "https://opendata.stib-mivb.be/",
        source: "https://github.com/belgianmobility/nextmoov-smop-general",
      },
      {
        id: "tec-feed-status",
        type: "gtfs-rt",
        operator: "TEC",
        url: null,
        notes: "SMOP README states TEC was still working on a public feed.",
        source: "https://github.com/belgianmobility/nextmoov-smop-general",
      },
    ];
  },
};
