import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { irailClient } from "../src/client.js";

describe("irailClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searchStations filters by name", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        station: [
          {
            id: "1",
            name: "Bruxelles-Midi",
            standardname: "Brussels-South/Brussel-Zuid",
            locationX: "4.33",
            locationY: "50.83",
          },
          {
            id: "2",
            name: "Bruxelles-Central",
            standardname: "Brussels-Central/Brussel-Centraal",
            locationX: "4.35",
            locationY: "50.84",
          },
          {
            id: "3",
            name: "Gent-Sint-Pieters",
            standardname: "Ghent-Sint-Pieters",
            locationX: "3.71",
            locationY: "51.03",
          },
        ],
      }),
    });

    const results = await irailClient.searchStations("bruxelles");
    expect(results).toHaveLength(2);
    expect(results[0]?.name).toBe("Bruxelles-Midi");
  });
});
