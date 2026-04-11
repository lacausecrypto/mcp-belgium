export interface CkanActionResponse<T> {
  success: boolean;
  result: T;
}

export interface FlandersDataset extends Record<string, unknown> {
  id: string;
  name?: string;
  title?: string;
}

export interface FlandersPackageSearchResult {
  count: number;
  results: FlandersDataset[];
}

export type FlandersOrganization = Record<string, unknown>;
