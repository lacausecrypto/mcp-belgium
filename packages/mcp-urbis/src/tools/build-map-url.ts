import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { urbisClient } from "../client.js";

export function registerBuildMapUrlTool(server: McpServer): void {
  server.tool(
    "urbis_build_map_url",
    "Build a public URBIS WMS GetMap URL for a layer and bounding box.",
    {
      service: z.enum(["vector", "raster"]).describe("Which public URBIS WMS service to use"),
      layerName: z.string().describe("Exact WMS layer name"),
      bbox: z.string().describe("Bounding box as minX,minY,maxX,maxY"),
      width: z.number().min(1).max(4096).default(512).describe("Map image width in pixels"),
      height: z.number().min(1).max(4096).default(512).describe("Map image height in pixels"),
      crs: z.string().default("EPSG:31370").describe("Coordinate reference system"),
      format: z.string().default("image/png").describe("Requested WMS image format"),
      transparent: z.boolean().default(true).describe("Whether the output image should be transparent"),
      styles: z.string().default("").describe("Optional WMS style name"),
    },
    async ({ service, layerName, bbox, width, height, crs, format, transparent, styles }) => {
      try {
        return jsonResult(urbisClient.buildMapUrl(service, layerName, bbox, width, height, crs, format, transparent, styles));
      } catch (e) {
        return errorResult(`Map URL generation failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
