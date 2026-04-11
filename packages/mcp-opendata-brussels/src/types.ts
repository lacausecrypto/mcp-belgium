export type BrusselsDataset = Record<string, unknown>;
export type BrusselsRecord = Record<string, unknown>;

export interface BrusselsDatasetListResponse {
  datasets?: BrusselsDataset[];
  results?: BrusselsDataset[];
}

export interface BrusselsRecordsResponse {
  records?: BrusselsRecord[];
  results?: BrusselsRecord[];
}
