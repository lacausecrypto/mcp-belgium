import { apiFetchText, CACHE_TTL, InMemoryCache, parseWmsLayers } from "@belgium-gov-mcp/core";
import type { UrbisLayer, UrbisMapRequest, UrbisServiceKind } from "./types.js";

const VECTOR_BASE = "https://geoservices-urbis.irisnet.be/geoserver/Urbis/wms";
const RASTER_BASE = "https://geoservices-urbis.irisnet.be/geoserver/urbisgrid/wms";
const cache = new InMemoryCache();

function getBase(service: UrbisServiceKind): string {
  return service === "vector" ? VECTOR_BASE : RASTER_BASE;
}

function uniqueLayers(layers: UrbisLayer[]): UrbisLayer[] {
  const deduped = new Map<string, UrbisLayer>();
  for (const layer of layers) {
    if (!deduped.has(layer.name)) {
      deduped.set(layer.name, layer);
    }
  }
  return Array.from(deduped.values());
}

async function getCapabilitiesXml(service: UrbisServiceKind): Promise<string> {
  const cacheKey = `capabilities:${service}`;
  const cached = await cache.get<string>(cacheKey);
  if (cached) return cached;

  const xml = await apiFetchText("urbis", getBase(service), "", {
    params: {
      service: "WMS",
      request: "GetCapabilities",
    },
  });

  await cache.set(cacheKey, xml, CACHE_TTL.SEMI_STATIC);
  return xml;
}

export const urbisClient = {
  async listLayers(service: UrbisServiceKind, query?: string, limit = 25): Promise<UrbisLayer[]> {
    const xml = await getCapabilitiesXml(service);
    const all = uniqueLayers(parseWmsLayers(xml));
    const normalizedQuery = query?.toLowerCase();
    const filtered = normalizedQuery
      ? all.filter((layer) => {
          const haystack = `${layer.name} ${layer.title ?? ""} ${layer.abstract ?? ""}`.toLowerCase();
          return haystack.includes(normalizedQuery);
        })
      : all;

    return filtered.slice(0, limit);
  },

  async getLayer(service: UrbisServiceKind, layerName: string): Promise<UrbisLayer> {
    const layers = await this.listLayers(service, undefined, 500);
    const layer = layers.find((item) => item.name === layerName);
    if (!layer) {
      throw new Error(`Layer not found in ${service} service: ${layerName}`);
    }
    return layer;
  },

  buildMapUrl(
    service: UrbisServiceKind,
    layerName: string,
    bbox: string,
    width = 512,
    height = 512,
    crs = "EPSG:31370",
    format = "image/png",
    transparent = true,
    styles = ""
  ): UrbisMapRequest {
    const url = new URL(getBase(service));
    url.searchParams.set("service", "WMS");
    url.searchParams.set("version", "1.3.0");
    url.searchParams.set("request", "GetMap");
    url.searchParams.set("layers", layerName);
    url.searchParams.set("styles", styles);
    url.searchParams.set("crs", crs);
    url.searchParams.set("bbox", bbox);
    url.searchParams.set("width", String(width));
    url.searchParams.set("height", String(height));
    url.searchParams.set("format", format);
    url.searchParams.set("transparent", transparent ? "true" : "false");

    return {
      service,
      layerName,
      bbox,
      width,
      height,
      crs,
      format,
      transparent,
      styles,
      url: url.toString(),
    };
  },
};
