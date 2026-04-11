export type StibRecord = Record<string, unknown>;

export interface StibRecordsResponse {
  records?: StibRecord[];
  results?: StibRecord[];
}
