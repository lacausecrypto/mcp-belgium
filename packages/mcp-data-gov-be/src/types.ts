export interface CkanActionResponse<T> {
  success: boolean;
  result: T;
}

export interface CkanResource extends Record<string, unknown> {
  id: string;
  name?: string;
  url?: string;
}

export interface CkanDataset extends Record<string, unknown> {
  id: string;
  name?: string;
  title?: string;
  resources?: CkanResource[];
}

export interface CkanPackageSearchResult {
  count: number;
  results: CkanDataset[];
}

export type CkanOrganization = Record<string, unknown>;
