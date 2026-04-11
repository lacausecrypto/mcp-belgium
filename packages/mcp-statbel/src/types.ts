export type StatbelView = Record<string, unknown>;
export type StatbelResult = Record<string, unknown>;

export interface StatbelViewsResponse {
  views?: StatbelView[];
  results?: StatbelView[];
  data?: StatbelView[];
}
