import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { bestAddressClient } from "../src/client.js";

describe("bestAddressClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("searches municipalities", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [{ id: "municipality-1", name: { fr: "Bruxelles" } }],
        total: 1,
      }),
    });

    const results = await bestAddressClient.searchMunicipalities({ name: "Bruxelles", limit: 10, page: 1 });
    expect(results.items).toHaveLength(1);
    expect(results.items[0]?.id).toBe("municipality-1");
  });
});
