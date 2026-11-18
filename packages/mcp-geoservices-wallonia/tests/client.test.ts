import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { walloniaGeoClient } from "../src/client.js";

describe("walloniaGeoClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists folders", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        folders: ["MOBILITE", "EAU"],
      }),
    });

    const results = await walloniaGeoClient.listFolders();
    expect(results).toEqual(["MOBILITE", "EAU"]);
  });

  it("turns ArcGIS HTTP-200 error bodies into thrown errors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ error: { code: 404, message: "Service not found", details: [] } }),
    });

    await expect(walloniaGeoClient.getService("NOPE/missing")).rejects.toThrow("ArcGIS error 404");
  });
});
