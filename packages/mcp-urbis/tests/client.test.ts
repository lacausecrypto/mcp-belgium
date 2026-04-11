import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { urbisClient } from "../src/client.js";

describe("urbisClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists WMS layers from capabilities xml", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () =>
        `<?xml version="1.0"?><WMS_Capabilities><Capability><Layer><Layer><Name>urbisFR</Name><Title>French base map</Title><CRS>EPSG:31370</CRS></Layer></Layer></Capability></WMS_Capabilities>`,
    });

    const results = await urbisClient.listLayers("vector", "urbis", 10);
    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe("urbisFR");
  });
});
