export type StatbelLocale = "en" | "fr" | "nl" | "de";

/** One entry of GET /bestat/api/views. */
export interface StatbelView {
  id: string;
  name: string;
  locale: string;
  lastPublishDate: number | null;
  published?: boolean;
}

export type StatbelFact = Record<string, string | number | null>;

/** GET /bestat/api/views/{id}/result/JSON */
export interface StatbelViewResult {
  facts: StatbelFact[];
}

export interface StatbelViewSummary {
  id: string;
  name: string;
  locale: string;
  lastPublished: string | null;
}

export interface StatbelSearchResult {
  total: number;
  views: StatbelViewSummary[];
}

export interface StatbelIndicatorResult {
  view: StatbelViewSummary;
  availableYears: string[];
  facts: StatbelFact[];
}
