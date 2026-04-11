export type WalloniaDataset = Record<string, unknown>;
export type WalloniaRecord = Record<string, unknown>;

export interface WalloniaDatasetListResponse {
  datasets?: WalloniaDataset[];
  results?: WalloniaDataset[];
}

export interface WalloniaRecordsResponse {
  records?: WalloniaRecord[];
  results?: WalloniaRecord[];
}
