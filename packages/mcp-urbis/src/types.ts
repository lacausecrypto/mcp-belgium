import type { WmsLayerSummary } from "@lacausecrypto/core";

export type UrbisServiceKind = "vector" | "raster";

export interface UrbisMapRequest {
  service: UrbisServiceKind;
  layerName: string;
  bbox: string;
  width: number;
  height: number;
  crs: string;
  format: string;
  transparent: boolean;
  styles: string;
  url: string;
}

export type UrbisLayer = WmsLayerSummary;
