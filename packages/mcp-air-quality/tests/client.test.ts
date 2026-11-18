import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { airQualityClient } from "../src/client.js";

function json(body: unknown) {
  return { ok: true, status: 200, json: async () => body };
}

const stations = [
  { properties: { id: 1109, label: "41B001 - Arts-Loi" }, geometry: { type: "Point", coordinates: [4.3687, 50.8457] } },
  { properties: { id: 1754, label: "41VBX1 - Brussel (Rue de Grand Ile)" }, geometry: { type: "Point", coordinates: [4.3480, 50.8470] } },
];

describe("airQualityClient", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("searchStations sorts the (alphabetical) upstream list by distance", async () => {
    mockFetch.mockResolvedValueOnce(json(stations));

    const results = await airQualityClient.searchStations(50.8466, 4.3528, 5000);

    expect(results.map((s) => (s.properties as { id: number }).id)).toEqual([1754, 1109]);
    expect(results[0].distanceKm).toBeCloseTo(0.34, 1);
  });

  it("getBelaqi reads the interpolated BelAQI raster at the point", async () => {
    mockFetch
      .mockResolvedValueOnce(json({ type: "FeatureCollection", features: [{ properties: { GRAY_INDEX: 3 } }] }))
      .mockResolvedValueOnce(json(stations));

    const result = await airQualityClient.getBelaqi(50.8466, 4.3528);

    const url = new URL(mockFetch.mock.calls[0][0] as string);
    expect(url.pathname).toBe("/wms");
    expect(url.searchParams.get("request")).toBe("GetFeatureInfo");
    expect(url.searchParams.get("query_layers")).toBe("rioifdm:belaqi");
    expect(result).toMatchObject({
      belaqi: 3,
      label: "Good",
      nearestStation: { id: 1754, label: "41VBX1 - Brussel (Rue de Grand Ile)" },
    });
  });

  it("getBelaqi fails clearly outside Belgium", async () => {
    mockFetch.mockResolvedValueOnce(json({ type: "FeatureCollection", features: [] }));
    await expect(airQualityClient.getBelaqi(48.85, 2.35)).rejects.toThrow("outside Belgium");
  });

  it("getCurrent reports the last non-null measurement", async () => {
    mockFetch
      .mockResolvedValueOnce(json(stations[0]))
      .mockResolvedValueOnce(json([{ id: "6504", label: "Nitrogen dioxide" }]))
      .mockResolvedValueOnce(
        json({ values: [{ timestamp: 1, value: 28.5 }, { timestamp: 2, value: null }] })
      );

    const result = await airQualityClient.getCurrent(1109);

    expect((result.measurements as Array<{ latest: unknown }>)[0].latest).toEqual({ timestamp: 1, value: 28.5 });
  });
});
