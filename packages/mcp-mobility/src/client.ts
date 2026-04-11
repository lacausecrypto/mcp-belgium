import { apiFetch } from "@belgium-gov-mcp/core";
import type { MobilityFeed, MobilityOperator, MobilityTripPlan } from "./types.js";

const BASE = "https://opendata-portal.api.production.belgianmobility.io";

function parseDateTime(datetime?: string): { date?: string; time?: string } {
  if (!datetime) return {};

  const [date, time] = datetime.split("T");
  return {
    date,
    time: time?.slice(0, 5),
  };
}

export const mobilityClient = {
  async planTrip(from: string, to: string, datetime?: string): Promise<MobilityTripPlan> {
    const { date, time } = parseDateTime(datetime);
    return apiFetch<MobilityTripPlan>("mobility", BASE, "/otp/routers/default/plan", {
      params: {
        fromPlace: from,
        toPlace: to,
        date,
        time,
        mode: "TRANSIT,WALK",
        arriveBy: false,
      },
      timeoutMs: 15000,
    });
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
