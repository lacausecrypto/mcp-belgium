import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { brusselsClient } from "../src/client.js";

describe("brusselsClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searchDatasets returns dataset results", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        datasets: [{ dataset_id: "air-quality", title: "Air Quality Brussels" }],
      }),
    });

    const results = await brusselsClient.searchDatasets("air", 10);
    expect(results).toHaveLength(1);
    expect(results[0]?.title).toBe("Air Quality Brussels");
  });
});
