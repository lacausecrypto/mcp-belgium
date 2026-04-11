import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { walloniaGeoClient } from "../client.js";

export function registerQueryLayerTool(server: McpServer): void {
  server.tool(
    "wallonia_geo_query_layer",
    "Query features from a Wallonia GeoServices ArcGIS feature layer.",
    {
      servicePath: z.string().describe("Service path, e.g. MOBILITE/AOT_ARRETTEC"),
      layerId: z.number().describe("Numeric ArcGIS layer identifier"),
      where: z.string().default("1=1").describe("ArcGIS where clause"),
      outFields: z.string().default("*").describe("Comma-separated fields or *"),
      limit: z.number().min(1).max(2000).default(20).describe("Maximum number of records to return"),
      returnGeometry: z.boolean().default(false).describe("Whether to include geometries in the response"),
    },
    async ({ servicePath, layerId, where, outFields, limit, returnGeometry }) => {
      try {
        return jsonResult(
          await walloniaGeoClient.queryLayer(servicePath, layerId, where, outFields, limit, returnGeometry)
        );
      } catch (e) {
        return errorResult(`Layer query failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
