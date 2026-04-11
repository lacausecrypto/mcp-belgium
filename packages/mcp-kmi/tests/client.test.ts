import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { kmiClient } from "../src/client.js";

describe("kmiClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists feature types from capabilities xml", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () =>
        `<?xml version="1.0"?><wfs:WFS_Capabilities><FeatureTypeList><FeatureType><Name>aws:aws_station</Name><Title>Stations</Title></FeatureType></FeatureTypeList></wfs:WFS_Capabilities>`,
    });

    const results = await kmiClient.listFeatureTypes("station", 10);
    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe("aws:aws_station");
  });
});
