import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { infrabelClient } from "../src/client.js";

describe("infrabelClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searches datasets", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [{ dataset_id: "rail", title: "Rail dataset" }],
      }),
    });

    const results = await infrabelClient.searchDatasets("rail", 10);
    expect(results).toHaveLength(1);
    expect(results[0]?.title).toBe("Rail dataset");
  });
});
