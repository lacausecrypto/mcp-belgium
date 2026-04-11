export type KboEnterprise = Record<string, unknown>;

export interface KboSearchResponse {
  enterprises?: KboEnterprise[];
  enterprise?: KboEnterprise[];
  results?: KboEnterprise[];
  data?: KboEnterprise[];
}
