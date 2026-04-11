import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { airQualityClient } from "../src/client.js";

describe("airQualityClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searchStations returns nearby stations", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        stations: [{ id: 1, name: "Brussels" }],
      }),
    });

    const results = await airQualityClient.searchStations(50.85, 4.35, 10000);
    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe("Brussels");
  });
});
