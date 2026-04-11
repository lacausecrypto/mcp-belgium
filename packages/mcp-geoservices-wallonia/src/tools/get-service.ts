import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { walloniaGeoClient } from "../client.js";

export function registerGetServiceTool(server: McpServer): void {
  server.tool(
    "wallonia_geo_get_service",
    "Get metadata for a specific Wallonia GeoServices ArcGIS MapServer service.",
    {
      servicePath: z.string().describe("Service path, e.g. MOBILITE/AOT_ARRETTEC"),
    },
    async ({ servicePath }) => {
      try {
        return jsonResult(await walloniaGeoClient.getService(servicePath));
      } catch (e) {
        return errorResult(`Service metadata fetch failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
