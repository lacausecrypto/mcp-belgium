import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { urbanBrusselsClient } from "../src/client.js";

describe("urbanBrusselsClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists feature types from capabilities xml", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () =>
        `<?xml version="1.0"?><wfs:WFS_Capabilities><FeatureTypeList><FeatureType><Name>URBAN_DCC_ER:municipalities_boundaries</Name><Title>Municipalities</Title></FeatureType></FeatureTypeList></wfs:WFS_Capabilities>`,
    });

    const results = await urbanBrusselsClient.listFeatureTypes("municipalities", 10);
    expect(results).toHaveLength(1);
    expect(results[0]?.name).toBe("URBAN_DCC_ER:municipalities_boundaries");
  });
});
