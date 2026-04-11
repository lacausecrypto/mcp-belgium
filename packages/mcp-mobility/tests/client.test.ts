import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { mobilityClient } from "../src/client.js";

describe("mobilityClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("planTrip returns a trip plan response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        plan: { itineraries: [{ duration: 1800 }] },
      }),
    });

    const result = await mobilityClient.planTrip("50.85,4.35", "51.22,4.40", "2026-04-11T14:30");
    expect((result.plan as { itineraries: unknown[] }).itineraries).toHaveLength(1);
  });
});
