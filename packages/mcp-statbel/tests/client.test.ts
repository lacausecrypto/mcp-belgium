import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { statbelClient } from "../src/client.js";

function json(body: unknown) {
  return { ok: true, status: 200, json: async () => body };
}

const views = [
  { id: "pop-old", name: "Total population in Belgium and the regions, 2015-2025", locale: "en", lastPublishDate: 1 },
  { id: "pop", name: "Total population in Belgium and the regions, 2016-2026", locale: "en", lastPublishDate: 2 },
  { id: "pop-fr", name: "Population totale en Belgique et dans les régions", locale: "fr", lastPublishDate: 3 },
  { id: "house", name: "House price indexes, last 2 years", locale: "en", lastPublishDate: 4 },
  {
    id: "emp",
    name: "Employment rate, unemployment rate and activity rate by gender for Belgium and the regions",
    locale: "en",
    lastPublishDate: 5,
  },
];

const populationFacts = {
  facts: [
    { Belgium: "Belgium", Region: "Flanders region", "Population on January 1st 2025": 6800000.0, "Population on January 1st 2026": 6898350.0 },
    { Belgium: "Belgium", Region: "Walloon region", "Population on January 1st 2025": 3700000.0, "Population on January 1st 2026": 3713450.0 },
    { Belgium: "Belgium", Region: null, "Population on January 1st 2025": 11800000.0, "Population on January 1st 2026": 11867634.0 },
  ],
};

describe("statbelClient", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("searchDatasets filters the full view list client-side by all terms and locale", async () => {
    mockFetch.mockResolvedValueOnce(json(views));

    const result = await statbelClient.searchDatasets("Population REGIONS", "en", 1);

    expect(mockFetch.mock.calls[0][0]).toBe("https://bestat.statbel.fgov.be/bestat/api/views/");
    expect(result.total).toBe(2);
    expect(result.views).toEqual([
      {
        id: "pop",
        name: "Total population in Belgium and the regions, 2016-2026",
        locale: "en",
        lastPublished: new Date(2).toISOString(),
      },
    ]);
  });

  it("getPopulation picks the latest curated view, the year column and the region", async () => {
    mockFetch.mockResolvedValueOnce(json(populationFacts));

    const result = await statbelClient.getPopulation(2026, "Wallonie");

    expect(mockFetch.mock.calls[0][0]).toBe("https://bestat.statbel.fgov.be/bestat/api/views/pop/result/JSON");
    expect(result.availableYears).toEqual(["2025", "2026"]);
    expect(result.facts).toEqual([
      { Belgium: "Belgium", Region: "Walloon region", "Population on January 1st 2026": 3713450 },
    ]);
  });

  it("maps region Belgium to the national total row", async () => {
    const result = await statbelClient.getPopulation(undefined, "Belgium");
    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.facts).toHaveLength(1);
    expect(result.facts[0].Region).toBeNull();
  });

  it("rejects unknown years and regions with an actionable message", async () => {
    await expect(statbelClient.getPopulation(1990)).rejects.toThrow("Available: 2025, 2026");
    await expect(statbelClient.getPopulation(undefined, "Mars")).rejects.toThrow("Unknown region");
  });

  it("getEmployment filters long-format rows by Year and rounds float noise", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        facts: [
          { Region: "Brussels-Capital region", Year: "2024", Gender: null, "Employment rate": 0.6300000000000022 },
          { Region: "Brussels-Capital region", Year: "2025", Gender: null, "Employment rate": 0.6400000000000022 },
        ],
      })
    );

    const result = await statbelClient.getEmployment(2025, "Brussel");

    expect(result.facts).toEqual([
      { Region: "Brussels-Capital region", Year: "2025", Gender: null, "Employment rate": 0.64 },
    ]);
  });
});
