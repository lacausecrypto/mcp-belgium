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

  it("getMunicipalitiesBoundaries queries the BruCiel communes layer", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ type: "FeatureCollection", features: [{ type: "Feature", properties: { NAME_FRE: "Ixelles" } }] }),
    });

    const result = await urbanBrusselsClient.getMunicipalitiesBoundaries(1);

    const url = new URL(mockFetch.mock.calls.at(-1)?.[0] as string);
    expect(url.searchParams.get("typeNames")).toBe("BRUCIEL:Institutionnel_LimitesCommunales");
    expect(url.searchParams.get("count")).toBe("1");
    expect(result.features).toHaveLength(1);
  });
});
