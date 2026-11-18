import { beforeEach, describe, expect, it, vi } from "vitest";

const mockFetch = vi.fn();
global.fetch = mockFetch;

import { dataGovBeClient } from "../src/client.js";

function json(body: unknown) {
  return { ok: true, status: 200, json: async () => body, text: async () => JSON.stringify(body) };
}

const dataset = {
  id: "statbel-population",
  title: { fr: "Population par commune", nl: "Bevolking per gemeente", en: "Population by municipality" },
  description: { fr: "Description FR", en: "x".repeat(600) },
  publisher: { name: "Statbel", type: "Organization" },
  keywords: [{ id: "population", label: "population", language: "fr" }],
  landing_page: [{ resource: "https://statbel.fgov.be/population" }],
  modified: "2026-01-01T00:00:00Z",
  issued: "2020-01-01T00:00:00Z",
  categories: [{ id: "SOCI", label: { en: "Population and society" } }],
  distributions: [
    {
      id: "dist-1",
      title: { fr: "population.csv" },
      format: { id: "CSV", label: "CSV" },
      license: { id: "CC_BY_4_0", label: "Creative Commons Attribution 4.0 International" },
      access_url: ["https://statbel.fgov.be/access"],
      download_url: ["https://statbel.fgov.be/population.csv"],
    },
    { id: "dist-2", format: { id: "CSV" } },
  ],
};

describe("dataGovBeClient", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("searchDatasets restricts to the data-gov-be catalogue and maps facets", async () => {
    mockFetch.mockResolvedValueOnce(json({ result: { count: 1, results: [dataset] } }));

    const result = await dataGovBeClient.searchDatasets("population", "Population, census", "Statbel", 5, "fr");

    const url = new URL(mockFetch.mock.calls[0][0] as string);
    expect(url.origin + url.pathname).toBe("https://data.europa.eu/api/hub/search/search");
    expect(url.searchParams.get("q")).toBe("population");
    expect(url.searchParams.get("limit")).toBe("5");
    expect(JSON.parse(url.searchParams.get("facets") ?? "")).toEqual({
      catalog: ["data-gov-be"],
      keywords: ["population", "census"],
      publisher: ["Statbel"],
    });
    expect(result.total).toBe(1);
    expect(result.datasets[0]).toMatchObject({
      id: "statbel-population",
      title: "Population par commune",
      description: "Description FR",
      publisher: "Statbel",
      formats: ["CSV"],
      resourceCount: 2,
      landingPage: "https://statbel.fgov.be/population",
      portalUrl: "https://data.europa.eu/data/datasets/statbel-population",
    });
  });

  it("getDataset falls back across languages and returns resources", async () => {
    mockFetch.mockResolvedValueOnce(json({ result: dataset }));

    const result = await dataGovBeClient.getDataset("statbel-population", "de");

    expect(mockFetch.mock.calls[0][0]).toBe("https://data.europa.eu/api/hub/search/datasets/statbel-population");
    expect(result.title).toBe("Population by municipality");
    expect(result.description).toHaveLength(600);
    expect(result.categories).toEqual(["Population and society"]);
    expect(result.resources[0]).toEqual({
      id: "dist-1",
      title: "population.csv",
      description: null,
      format: "CSV",
      license: "Creative Commons Attribution 4.0 International",
      accessUrl: "https://statbel.fgov.be/access",
      downloadUrl: "https://statbel.fgov.be/population.csv",
      mediaType: null,
      modified: null,
    });
  });

  it("listOrganizations reads the publisher facet", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        result: {
          count: 10,
          results: [],
          facets: [
            {
              id: "publisher",
              items: [
                { id: "DOV", title: "DOV", count: 7 },
                { id: "Statbel", title: "Statbel", count: 3 },
              ],
            },
          ],
        },
      })
    );

    expect(await dataGovBeClient.listOrganizations(1)).toEqual([{ name: "DOV", datasetCount: 7 }]);
  });

  it("getResource parses the DCAT distribution and skips machine translations", async () => {
    mockFetch.mockResolvedValueOnce(
      json({
        "@graph": [
          { "@id": "http://publications.europa.eu/resource/authority/language/FRA", "@type": "skos:Concept" },
          {
            "@id": "http://data.europa.eu/88u/distribution/dist-9",
            "@type": "dcat:Distribution",
            "dct:title": [
              { "@language": "en-t-fr-t0-mtec", "@value": "machine translated" },
              { "@language": "fr", "@value": "fichier.zip" },
            ],
            "dct:format": { "@id": "http://publications.europa.eu/resource/authority/file-type/SHP" },
            "dct:license": { "@id": "http://publications.europa.eu/resource/authority/licence/CC_BY_4_0" },
            "dcat:accessURL": { "@id": "https://example.be/access" },
            "dcat:downloadURL": { "@id": "https://example.be/file.zip" },
            "dct:modified": { "@value": "2023-04-18T08:56:31Z", "@type": "xsd:dateTime" },
          },
        ],
      })
    );

    const result = await dataGovBeClient.getResource("dist-9");

    expect(mockFetch.mock.calls[0][0]).toBe("https://data.europa.eu/api/hub/repo/distributions/dist-9.jsonld");
    expect(result).toEqual({
      id: "dist-9",
      title: "fichier.zip",
      description: null,
      format: "SHP",
      license: "CC_BY_4_0",
      accessUrl: "https://example.be/access",
      downloadUrl: "https://example.be/file.zip",
      mediaType: null,
      modified: "2023-04-18T08:56:31Z",
    });
  });

  it("getResource fails loudly when no distribution node is present", async () => {
    mockFetch.mockResolvedValueOnce(json({ "@graph": [] }));
    await expect(dataGovBeClient.getResource("missing")).rejects.toThrow("no dcat:Distribution");
  });
});
