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

  it("searchByActivity queries the NACE companies endpoint with version and page", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ cbe_number: "0123456789", denomination: "Dev SRL" }],
        meta: { current_page: 2, last_page: 9, total: 420 },
      }),
    });

    const result = await kboClient.searchByActivity("62.010", "2008", 2);

    const url = new URL(mockFetch.mock.calls[0][0] as string);
    expect(url.pathname).toBe("/api/v1/nace/62010/companies");
    expect(url.searchParams.get("nace_version")).toBe("2008");
    expect(url.searchParams.get("page")).toBe("2");
    expect(mockFetch.mock.calls[0][1].headers.Authorization).toBe("Bearer test-key");
    expect(result).toMatchObject({ naceCode: "62010", page: 2, lastPage: 9, total: 420 });
    expect(result.companies).toHaveLength(1);
  });

  it("searchByActivity rejects codes that are too short", async () => {
    await expect(kboClient.searchByActivity("6")).rejects.toThrow("Invalid NACE code");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("explains how to configure the key when CBEAPI_KEY is missing", async () => {
    delete process.env.CBEAPI_KEY;
    await expect(kboClient.getEnterprise("0403.170.701")).rejects.toThrow('"CBEAPI_KEY"');
  });

  it("fails loudly on an unknown search response shape", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ unexpected: true }) });
    await expect(kboClient.searchEnterprise("Shape Test", "name")).rejects.toThrow("Unexpected CBEAPI search response");
  });
});
