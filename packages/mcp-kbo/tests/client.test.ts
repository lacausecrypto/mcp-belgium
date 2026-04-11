import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { kboClient } from "../src/client.js";

describe("kboClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CBEAPI_KEY = "test-key";
  });

  it("searchEnterprise returns normalized results", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        enterprises: [
          { enterpriseNumber: "0123456789", name: "Example SRL" },
          { enterpriseNumber: "9876543210", name: "Another SRL" },
        ],
      }),
    });

    const results = await kboClient.searchEnterprise("Example", "name");
    expect(results).toHaveLength(2);
    expect(results[0]?.name).toBe("Example SRL");
  });

  it("searchByActivity explains that the current upstream no longer supports it", async () => {
    await expect(kboClient.searchByActivity("62.010")).rejects.toThrow("does not expose a public company-by-NACE");
  });
});
