import { apiFetch, CACHE_TTL, InMemoryCache, TokenBucket } from "@lacausecrypto/core";
import type {
  DatasetDetail,
  DatasetSearchResult,
  DatasetSummary,
  HubDataset,
  HubDatasetResponse,
  HubDistribution,
  HubLabel,
  HubSearchResponse,
  JsonLdDocument,
  JsonLdNode,
  Language,
  MultiLang,
  Organization,
  Resource,
} from "./types.js";

/**
 * data.gov.be closed its CKAN API in 2025. Its DCAT-AP catalogue is harvested by the
 * official European Data Portal under the catalogue id `data-gov-be`, which exposes a
 * stable, keyless search API. All tools query that mirror.
 */
const HUB = "https://data.europa.eu/api/hub";
const CATALOG_ID = "data-gov-be";
const PORTAL = "https://data.europa.eu/data/datasets";
const DESCRIPTION_PREVIEW = 400;
const limiter = new TokenBucket(5, 250);
const cache = new InMemoryCache();

/** Multilingual metadata: requested language first, then Belgian languages, then any. */
function pick(value: MultiLang | string | undefined, lang: Language): string | null {
  if (value === undefined) return null;
  if (typeof value === "string") return value;
  for (const key of [lang, "en", "fr", "nl", "de"]) {
    if (value[key]) return value[key];
  }
  return Object.values(value)[0] ?? null;
}

function truncate(text: string | null, max: number): string | null {
  if (text === null || text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

function labelOf(label: HubLabel | undefined, lang: Language): string | null {
  if (!label) return null;
  return pick(label.label, lang) ?? label.id ?? null;
}

function landingPageOf(dataset: HubDataset): string | null {
  const first = dataset.landing_page?.[0];
  if (first === undefined) return null;
  return typeof first === "string" ? first : (first.resource ?? null);
}

function toResource(dist: HubDistribution, lang: Language): Resource {
  return {
    id: dist.id,
    title: pick(dist.title, lang),
    description: pick(dist.description, lang),
    format: labelOf(dist.format, lang),
    license: labelOf(dist.license, lang),
    accessUrl: dist.access_url?.[0] ?? null,
    downloadUrl: dist.download_url?.[0] ?? null,
    mediaType: dist.media_type ?? null,
    modified: dist.modified ?? null,
  };
}

function toSummary(dataset: HubDataset, lang: Language): DatasetSummary {
  const distributions = dataset.distributions ?? [];
  const formats = new Set<string>();
  for (const dist of distributions) {
    const format = dist.format?.id;
    if (format) formats.add(format);
  }
  return {
    id: dataset.id,
    title: pick(dataset.title, lang),
    description: truncate(pick(dataset.description, lang), DESCRIPTION_PREVIEW),
    publisher: dataset.publisher?.name ?? null,
    keywords: (dataset.keywords ?? []).map((k) => k.label ?? k.id),
    modified: dataset.modified ?? null,
    formats: [...formats],
    resourceCount: distributions.length,
    landingPage: landingPageOf(dataset),
    portalUrl: `${PORTAL}/${encodeURIComponent(dataset.id)}`,
  };
}

function splitList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

/** JSON-LD literal(s) → best value; machine translations (`xx-t-yy-…`) are skipped. */
function literal(value: unknown, lang: Language): string | null {
  const items = Array.isArray(value) ? value : value === undefined ? [] : [value];
  const byLang: MultiLang = {};
  for (const item of items) {
    if (typeof item === "string") return item;
    if (typeof item !== "object" || item === null) continue;
    const v = (item as { "@value"?: unknown })["@value"];
    if (typeof v !== "string") continue;
    const l = (item as { "@language"?: unknown })["@language"];
    if (typeof l !== "string") return v;
    if (!l.includes("-t-")) byLang[l] = v;
  }
  return Object.keys(byLang).length > 0 ? pick(byLang, lang) : null;
}

function iri(value: unknown): string | null {
  const first = Array.isArray(value) ? value[0] : value;
  if (typeof first === "object" && first !== null) {
    const id = (first as { "@id"?: unknown })["@id"];
    if (typeof id === "string") return id;
  }
  return null;
}

/** Last path segment of an EU authority IRI, e.g. …/file-type/CSV → CSV. */
function authorityCode(value: unknown): string | null {
  const id = iri(value);
  return id === null ? null : (id.split("/").pop() ?? id);
}

function isDistribution(node: JsonLdNode): boolean {
  const type = node["@type"];
  return Array.isArray(type) ? type.includes("dcat:Distribution") : type === "dcat:Distribution";
}

export const dataGovBeClient = {
  async searchDatasets(
    query: string,
    tags?: string,
    organization?: string,
    rows = 10,
    lang: Language = "en"
  ): Promise<DatasetSearchResult> {
    const facets: Record<string, string[]> = { catalog: [CATALOG_ID] };
    const keywords = splitList(tags).map((t) => t.toLowerCase());
    if (keywords.length > 0) facets.keywords = keywords;
    if (organization) facets.publisher = [organization];

    const cacheKey = `search:${lang}:${rows}:${query}:${JSON.stringify(facets)}`;
    const cached = await cache.get<DatasetSearchResult>(cacheKey);
    if (cached) return cached;

    const data = await apiFetch<HubSearchResponse>("data-gov-be", HUB, "/search/search", {
      params: { q: query, filter: "dataset", facets: JSON.stringify(facets), limit: rows, page: 0 },
      rateLimiter: limiter,
      timeoutMs: 20000,
    });

    const result: DatasetSearchResult = {
      total: data.result.count,
      datasets: data.result.results.map((d) => toSummary(d, lang)),
    };
    await cache.set(cacheKey, result, CACHE_TTL.SEMI_STATIC);
    return result;
  },

  async getDataset(datasetId: string, lang: Language = "en"): Promise<DatasetDetail> {
    const cacheKey = `dataset:${lang}:${datasetId}`;
    const cached = await cache.get<DatasetDetail>(cacheKey);
    if (cached) return cached;

    const data = await apiFetch<HubDatasetResponse>(
      "data-gov-be",
      HUB,
      `/search/datasets/${encodeURIComponent(datasetId)}`,
      { rateLimiter: limiter, timeoutMs: 20000 }
    );
    const dataset = data.result;
    const summary = toSummary(dataset, lang);
    const result: DatasetDetail = {
      id: summary.id,
      title: summary.title,
      description: pick(dataset.description, lang),
      publisher: summary.publisher,
      keywords: summary.keywords,
      modified: summary.modified,
      issued: dataset.issued ?? null,
      categories: (dataset.categories ?? []).map((c) => pick(c.label, lang) ?? c.id),
      landingPage: summary.landingPage,
      portalUrl: summary.portalUrl,
      resources: (dataset.distributions ?? []).map((d) => toResource(d, lang)),
    };
    await cache.set(cacheKey, result, CACHE_TTL.SEMI_STATIC);
    return result;
  },

  async listOrganizations(limit = 25): Promise<Organization[]> {
    const cacheKey = `organizations:${limit}`;
    const cached = await cache.get<Organization[]>(cacheKey);
    if (cached) return cached;

    const data = await apiFetch<HubSearchResponse>("data-gov-be", HUB, "/search/search", {
      params: { filter: "dataset", facets: JSON.stringify({ catalog: [CATALOG_ID] }), limit: 0 },
      rateLimiter: limiter,
      timeoutMs: 20000,
    });
    const publisherFacet = data.result.facets?.find((f) => f.id === "publisher");
    if (!publisherFacet) {
      throw new Error("data.europa.eu response did not include the publisher facet");
    }
    const result = publisherFacet.items.slice(0, limit).map((item) => ({
      name: item.id,
      datasetCount: item.count,
    }));
    await cache.set(cacheKey, result, CACHE_TTL.STATIC);
    return result;
  },

  async getResource(resourceId: string, lang: Language = "en"): Promise<Resource> {
    const cacheKey = `resource:${lang}:${resourceId}`;
    const cached = await cache.get<Resource>(cacheKey);
    if (cached) return cached;

    const doc = await apiFetch<JsonLdDocument>(
      "data-gov-be",
      HUB,
      `/repo/distributions/${encodeURIComponent(resourceId)}.jsonld`,
      { headers: { Accept: "application/ld+json" }, rateLimiter: limiter, timeoutMs: 20000 }
    );
    const node = doc["@graph"]?.find(isDistribution);
    if (!node) {
      throw new Error(`data.europa.eu returned no dcat:Distribution for resource ${resourceId}`);
    }
    const result: Resource = {
      id: resourceId,
      title: literal(node["dct:title"], lang),
      description: literal(node["dct:description"], lang),
      format: authorityCode(node["dct:format"]),
      license: authorityCode(node["dct:license"]),
      accessUrl: iri(node["dcat:accessURL"]),
      downloadUrl: iri(node["dcat:downloadURL"]),
      mediaType: iri(node["dcat:mediaType"]),
      modified: literal(node["dct:modified"], lang),
    };
    await cache.set(cacheKey, result, CACHE_TTL.SEMI_STATIC);
    return result;
  },
};
