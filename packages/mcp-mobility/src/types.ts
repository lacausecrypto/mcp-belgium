export type MobilityOperator = Record<string, unknown>;
export type MobilityFeed = Record<string, unknown>;

/** Transitous (MOTIS 2) geocode result. */
export interface TransitousPlace {
  type: string;
  name: string;
  id: string;
  lat: number;
  lon: number;
  country?: string;
}

interface TransitousStopRef {
  name: string;
}

export interface TransitousLeg {
  mode: string;
  from: TransitousStopRef;
  to: TransitousStopRef;
  startTime: string;
  endTime: string;
  realTime?: boolean;
  headsign?: string;
  routeShortName?: string;
  displayName?: string;
  agencyName?: string;
  cancelled?: boolean;
}

export interface TransitousItinerary {
  duration: number;
  startTime: string;
  endTime: string;
  transfers: number;
  legs: TransitousLeg[];
}

export interface TransitousPlanResponse {
  itineraries: TransitousItinerary[];
}

export interface ResolvedPlace {
  query: string;
  name: string;
  lat: number;
  lon: number;
}

export interface TripLeg {
  mode: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  line: string | null;
  operator: string | null;
  headsign: string | null;
  realTime: boolean;
  cancelled: boolean;
}

export interface TripItinerary {
  departure: string;
  arrival: string;
  durationMinutes: number;
  transfers: number;
  legs: TripLeg[];
}

export interface MobilityTripPlan {
  from: ResolvedPlace;
  to: ResolvedPlace;
  timezone: "Europe/Brussels";
  itineraries: TripItinerary[];
}
