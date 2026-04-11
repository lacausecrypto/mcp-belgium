export interface ArcGisServiceDirectory {
  currentVersion?: number;
  folders?: string[];
  services?: Array<{ name: string; type: string }>;
}

export interface ArcGisServiceDetails {
  mapName?: string;
  description?: string;
  copyrightText?: string;
  layers?: Array<Record<string, unknown>>;
  tables?: Array<Record<string, unknown>>;
  capabilities?: string;
  [key: string]: unknown;
}

export interface ArcGisLayerQueryResult {
  fields?: Array<Record<string, unknown>>;
  features?: Array<Record<string, unknown>>;
  exceededTransferLimit?: boolean;
  [key: string]: unknown;
}
