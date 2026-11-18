export type Language = "en" | "fr" | "nl" | "de";

/** Language-keyed strings as returned by the data.europa.eu hub search API. */
export type MultiLang = Record<string, string>;

export interface HubLabel {
  id?: string;
  label?: string | MultiLang;
  resource?: string;
}

export interface HubDistribution {
  id: string;
  title?: MultiLang;
  description?: MultiLang;
  format?: HubLabel;
  license?: HubLabel;
  media_type?: string;
  access_url?: string[];
  download_url?: string[];
  modified?: string;
}

export interface HubDataset {
  id: string;
  title?: MultiLang;
  description?: MultiLang;
  publisher?: { name?: string; resource?: string; type?: string };
  keywords?: Array<{ id: string; label?: string; language?: string }>;
  categories?: Array<{ id: string; label?: MultiLang }>;
  landing_page?: Array<{ resource?: string } | string>;
  issued?: string;
  modified?: string;
  distributions?: HubDistribution[];
  catalog?: { id?: string };
}

export interface HubFacet {
  id: string;
  items: Array<{ id: string; title: string | MultiLang; count: number }>;
}

export interface HubSearchResponse {
  result: {
    count: number;
    results: HubDataset[];
    facets?: HubFacet[];
  };
}

export interface HubDatasetResponse {
  result: HubDataset;
}

export interface JsonLdNode {
  "@id"?: string;
  "@type"?: string | string[];
  [key: string]: unknown;
}

export interface JsonLdDocument {
  "@graph"?: JsonLdNode[];
}

export interface Resource {
  id: string;
  title: string | null;
  description: string | null;
  format: string | null;
  license: string | null;
  accessUrl: string | null;
  downloadUrl: string | null;
  mediaType: string | null;
  modified: string | null;
}

export interface DatasetSummary {
  id: string;
  title: string | null;
  description: string | null;
  publisher: string | null;
  keywords: string[];
  modified: string | null;
  formats: string[];
  resourceCount: number;
  landingPage: string | null;
  portalUrl: string;
}

export interface DatasetDetail extends Omit<DatasetSummary, "formats" | "resourceCount"> {
  issued: string | null;
  categories: string[];
  resources: Resource[];
}

export interface DatasetSearchResult {
  total: number;
  datasets: DatasetSummary[];
}

export interface Organization {
  name: string;
  datasetCount: number;
}
