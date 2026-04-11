import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { statbelClient } from "../src/client.js";

describe("statbelClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searchDatasets returns view results", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        views: [{ id: "view-1", title: "Population by municipality" }],
      }),
    });

    const results = await statbelClient.searchDatasets("population");
    expect(results).toHaveLength(1);
    expect(results[0]?.title).toBe("Population by municipality");
  });
});
