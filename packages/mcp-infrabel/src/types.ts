export interface InfrabelDataset {
  dataset_id?: string;
  dataset_uid?: string;
  title?: string;
  has_records?: boolean;
  attachments?: Array<Record<string, unknown>>;
  fields?: Array<Record<string, unknown>>;
  metas?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface InfrabelRecord {
  recordid?: string;
  fields?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface InfrabelDatasetListResponse {
  total_count?: number;
  datasets?: InfrabelDataset[];
  results?: InfrabelDataset[];
}

export interface InfrabelRecordsResponse {
  total_count?: number;
  records?: InfrabelRecord[];
  results?: InfrabelRecord[];
}
