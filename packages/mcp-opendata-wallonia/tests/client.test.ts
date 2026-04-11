import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { walloniaClient } from "../src/client.js";

describe("walloniaClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searchDatasets returns dataset results", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        datasets: [{ dataset_id: "water-quality", title: "Water Quality Wallonia" }],
      }),
    });

    const results = await walloniaClient.searchDatasets("water", 10);
    expect(results).toHaveLength(1);
    expect(results[0]?.title).toBe("Water Quality Wallonia");
  });
});
