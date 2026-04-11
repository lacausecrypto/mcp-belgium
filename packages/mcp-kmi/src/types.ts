import type { WfsFeatureTypeSummary, XsdElementSummary } from "@lacausecrypto/core";

export interface GeoJsonFeatureCollection {
  type: "FeatureCollection";
  features: Array<Record<string, unknown>>;
  totalFeatures?: number;
  numberMatched?: number;
  numberReturned?: number;
  timeStamp?: string;
  [key: string]: unknown;
}

export interface FeatureTypeDescription {
  typeName: string;
  fields: XsdElementSummary[];
}

export type KmiFeatureType = WfsFeatureTypeSummary;
