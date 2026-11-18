import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { mobilityClient, toUtcIso } from "../src/client.js";

function json(body: unknown) {
  return { ok: true, status: 200, json: async () => body };
}

describe("toUtcIso", () => {
  it("reads naive datetimes as Brussels wall-clock time (winter and summer)", () => {
    expect(toUtcIso("2026-01-15T08:00")).toBe("2026-01-15T07:00:00.000Z");
    expect(toUtcIso("2026-07-15T08:00")).toBe("2026-07-15T06:00:00.000Z");
  });

  it("keeps explicit offsets and rejects garbage", () => {
    expect(toUtcIso("2026-07-15T08:00:00Z")).toBe("2026-07-15T08:00:00.000Z");
    expect(() => toUtcIso("tomorrow")).toThrow("Invalid datetime");
  });
});

describe("mobilityClient.planTrip", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("geocodes free text, plans via Transitous and returns Brussels-local legs", async () => {
    mockFetch
      .mockResolvedValueOnce(json([{ type: "STOP", name: "Bruxelles-Central", id: "be-sncb_S8813003", lat: 50.8456, lon: 4.3568, country: "BE" }]))
      .mockResolvedValueOnce(
        json({
          itineraries: [
            {
              duration: 1740,
              startTime: "2026-11-19T08:14:00Z",
              endTime: "2026-11-19T08:43:00Z",
              transfers: 0,
              legs: [
                {
                  mode: "REGIONAL_RAIL",
                  from: { name: "Bruxelles-Central" },
                  to: { name: "Louvain" },
                  startTime: "2026-11-19T08:16:00Z",
                  endTime: "2026-11-19T08:40:00Z",
                  realTime: true,
                  headsign: "Genk",
                  displayName: "IC 3608",
                  agencyName: "NMBS/SNCB",
                },
              ],
            },
          ],
        })
      );

    const result = await mobilityClient.planTrip("Bruxelles-Central", "50.8812,4.7157", "2026-11-19T09:00");

    const geocodeUrl = new URL(mockFetch.mock.calls[0][0] as string);
    expect(geocodeUrl.pathname).toBe("/api/v1/geocode");
    expect(geocodeUrl.searchParams.get("text")).toBe("Bruxelles-Central");

    const planUrl = new URL(mockFetch.mock.calls[1][0] as string);
    expect(planUrl.pathname).toBe("/api/v5/plan");
    expect(planUrl.searchParams.get("fromPlace")).toBe("50.8456,4.3568");
    expect(planUrl.searchParams.get("toPlace")).toBe("50.8812,4.7157");
    expect(planUrl.searchParams.get("time")).toBe("2026-11-19T08:00:00.000Z");
    expect(mockFetch.mock.calls[1][1].headers["User-Agent"]).toContain("mcp-belgium");

    expect(result.itineraries[0]).toEqual({
      departure: "2026-11-19 09:14",
      arrival: "2026-11-19 09:43",
      durationMinutes: 29,
      transfers: 0,
      legs: [
        {
          mode: "REGIONAL_RAIL",
          from: "Bruxelles-Central",
          to: "Louvain",
          departure: "2026-11-19 09:16",
          arrival: "2026-11-19 09:40",
          line: "IC 3608",
          operator: "NMBS/SNCB",
          headsign: "Genk",
          realTime: true,
          cancelled: false,
        },
      ],
    });
  });

  it("fails clearly when a place cannot be geocoded", async () => {
    mockFetch.mockResolvedValue(json([]));
    await expect(mobilityClient.planTrip("Nowhere-sur-Rien", "Gent")).rejects.toThrow('No place found for "Nowhere-sur-Rien"');
  });
});
