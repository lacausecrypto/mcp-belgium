import { apiFetch, CACHE_TTL, InMemoryCache } from "@lacausecrypto/core";
import type {
  StatbelFact,
  StatbelIndicatorResult,
  StatbelLocale,
  StatbelSearchResult,
  StatbelView,
  StatbelViewResult,
  StatbelViewSummary,
} from "./types.js";

/**
 * Be.STAT public API. `GET /views` returns every published view in every locale and
 * ignores query parameters, so search and locale filtering happen client-side.
 */
const BASE = "https://bestat.statbel.fgov.be/bestat/api/views";
const cache = new InMemoryCache();

/** Curated English views, resolved by name so view-id churn on republication is tolerated. */
const INDICATORS = {
  population: /^Total population in Belgium and the regions/i,
  cpi: /^Consumer price index, inflation, health index/i,
  employment: /^Employment rate, unemployment rate and activity rate by gender for Belgium and the regions$/i,
} as const;

type Indicator = keyof typeof INDICATORS;

const REGION_ALIASES: Record<string, string | null> = {
  belgium: null,
  belgique: null,
  belgie: null,
  "belgië": null,
  brussels: "brussels",
  bruxelles: "brussels",
  brussel: "brussels",
  flanders: "flanders",
  vlaanderen: "flanders",
  flandre: "flanders",
  wallonia: "walloon",
  wallonie: "walloon",
  walloon: "walloon",
  "wallonië": "walloon",
};

function summarize(view: StatbelView): StatbelViewSummary {
  return {
    id: view.id,
    name: view.name,
    locale: view.locale,
    lastPublished: view.lastPublishDate ? new Date(view.lastPublishDate).toISOString() : null,
  };
}

async function listViews(): Promise<StatbelView[]> {
  const cached = await cache.get<StatbelView[]>("views");
  if (cached) return cached;
  const data = await apiFetch<StatbelView[]>("statbel", BASE, "", { timeoutMs: 30000 });
  if (!Array.isArray(data)) {
    throw new Error("Unexpected Be.STAT views response: expected an array");
  }
  const views = data.filter((v) => v.published !== false);
  await cache.set("views", views, CACHE_TTL.STATIC);
  return views;
}

/** Be.STAT serialises doubles with binary noise (0.6300000000000022). */
function cleanFact(fact: StatbelFact): StatbelFact {
  const out: StatbelFact = {};
  for (const [key, value] of Object.entries(fact)) {
    out[key] = typeof value === "number" ? Number(value.toPrecision(12)) : value;
  }
  return out;
}

async function getViewResult(viewId: string): Promise<StatbelViewResult> {
  const cacheKey = `result:${viewId}`;
  const cached = await cache.get<StatbelViewResult>(cacheKey);
  if (cached) return cached;
  const data = await apiFetch<StatbelViewResult>("statbel", BASE, `/${encodeURIComponent(viewId)}/result/JSON`, {
    timeoutMs: 60000,
  });
  if (!Array.isArray(data.facts)) {
    throw new Error(`Be.STAT view ${viewId} returned no facts array`);
  }
  const result = { facts: data.facts.map(cleanFact) };
  await cache.set(cacheKey, result, CACHE_TTL.SEMI_STATIC);
  return result;
}

function resolveRegion(region: string): string | null {
  const key = region.trim().toLowerCase();
  if (!(key in REGION_ALIASES)) {
    throw new Error(`Unknown region "${region}". Use Belgium, Brussels, Flanders or Wallonia.`);
  }
  return REGION_ALIASES[key];
}

/** Statbel encodes the national total as a null Region. */
function matchesRegion(fact: StatbelFact, region: string | null): boolean {
  const value = fact.Region;
  if (region === null) return value === null || value === undefined;
  return typeof value === "string" && value.toLowerCase().includes(region);
}

function yearsOf(facts: StatbelFact[]): string[] {
  const years = new Set<string>();
  for (const fact of facts) {
    if (fact.Year !== null && fact.Year !== undefined) years.add(String(fact.Year));
    for (const key of Object.keys(fact)) {
      const m = /(\d{4})$/.exec(key);
      if (m) years.add(m[1]);
    }
  }
  return [...years].sort();
}

/** Population views are wide (one column per year): keep only the requested year column. */
function selectYear(fact: StatbelFact, year: number): StatbelFact | null {
  if ("Year" in fact) return String(fact.Year) === String(year) ? fact : null;
  const out: StatbelFact = {};
  let hit = false;
  for (const [key, value] of Object.entries(fact)) {
    const m = /(\d{4})$/.exec(key);
    if (!m) out[key] = value;
    else if (m[1] === String(year)) {
      out[key] = value;
      hit = true;
    }
  }
  return hit ? out : null;
}

async function resolveIndicator(indicator: Indicator): Promise<StatbelView> {
  const pattern = INDICATORS[indicator];
  const candidates = (await listViews())
    .filter((v) => v.locale === "en" && pattern.test(v.name))
    .sort((a, b) => (b.lastPublishDate ?? 0) - (a.lastPublishDate ?? 0));
  const view = candidates[0];
  if (!view) {
    throw new Error(`Statbel no longer publishes the ${indicator} view (${pattern}); use statbel_search_datasets`);
  }
  return view;
}

async function getIndicator(
  indicator: Indicator,
  filters: { year?: number; region?: string }
): Promise<StatbelIndicatorResult> {
  const view = await resolveIndicator(indicator);
  const { facts } = await getViewResult(view.id);
  const availableYears = yearsOf(facts);
  const region = filters.region === undefined ? undefined : resolveRegion(filters.region);

  let selected = region === undefined ? facts : facts.filter((f) => matchesRegion(f, region));
  if (filters.year !== undefined) {
    if (!availableYears.includes(String(filters.year))) {
      throw new Error(
        `Year ${filters.year} is not in the Statbel ${indicator} view "${view.name}". Available: ${availableYears.join(", ")}`
      );
    }
    const year = filters.year;
    selected = selected.map((f) => selectYear(f, year)).filter((f): f is StatbelFact => f !== null);
  }
  return { view: summarize(view), availableYears, facts: selected };
}

export const statbelClient = {
  async searchDatasets(query: string, locale?: StatbelLocale, limit = 20): Promise<StatbelSearchResult> {
    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 0);
    const matches = (await listViews())
      .filter((v) => locale === undefined || v.locale === locale)
      .filter((v) => {
        const name = v.name.toLowerCase();
        return terms.every((t) => name.includes(t));
      })
      .sort((a, b) => (b.lastPublishDate ?? 0) - (a.lastPublishDate ?? 0));
    return { total: matches.length, views: matches.slice(0, limit).map(summarize) };
  },

  async getView(viewId: string, limit = 200): Promise<{ view: StatbelViewSummary; totalFacts: number; facts: StatbelFact[] }> {
    const view = (await listViews()).find((v) => v.id === viewId);
    if (!view) {
      throw new Error(`Unknown Statbel view id ${viewId}; get ids from statbel_search_datasets`);
    }
    const { facts } = await getViewResult(viewId);
    return { view: summarize(view), totalFacts: facts.length, facts: facts.slice(0, limit) };
  },

  getPopulation(year?: number, region?: string): Promise<StatbelIndicatorResult> {
    return getIndicator("population", { year, region });
  },

  getCpi(year?: number): Promise<StatbelIndicatorResult> {
    return getIndicator("cpi", { year });
  },

  getEmployment(year?: number, region?: string): Promise<StatbelIndicatorResult> {
    return getIndicator("employment", { year, region });
  },
};
