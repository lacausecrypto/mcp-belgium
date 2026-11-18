export type KboEnterprise = Record<string, unknown>;

export type NaceVersion = "2003" | "2008" | "2025";

export interface KboSearchResponse {
  enterprises?: KboEnterprise[];
  enterprise?: KboEnterprise[];
  results?: KboEnterprise[];
  data?: KboEnterprise[];
}

/** Laravel-style paginated envelope used by CBEAPI list endpoints. */
export interface KboPaginatedResponse {
  data: KboEnterprise[];
  meta?: { current_page?: number; last_page?: number; per_page?: number; total?: number };
}

export interface KboActivitySearchResult {
  naceCode: string;
  naceVersion: NaceVersion;
  page: number;
  lastPage: number | null;
  total: number | null;
  companies: KboEnterprise[];
}
