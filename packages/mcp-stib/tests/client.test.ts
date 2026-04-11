import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;
process.env.STIB_API_KEY = "test-key";

import { stibClient } from "../src/client.js";

describe("stibClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searchStops returns stop results", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        records: [{ stop_name: "Rogier", pointid: "0511" }],
      }),
    });

    const results = await stibClient.searchStops("Rogier");
    expect(results).toHaveLength(1);
    expect(results[0]?.stop_name).toBe("Rogier");
  });
});
