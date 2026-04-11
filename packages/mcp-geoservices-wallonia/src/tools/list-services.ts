import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { walloniaGeoClient } from "../client.js";

export function registerListServicesTool(server: McpServer): void {
  server.tool(
    "wallonia_geo_list_services",
    "List ArcGIS REST services published in a Wallonia GeoServices folder.",
    {
      folder: z.string().optional().describe("Optional folder name, e.g. MOBILITE"),
    },
    async ({ folder }) => {
      try {
        return jsonResult(await walloniaGeoClient.listServices(folder));
      } catch (e) {
        return errorResult(`Service listing failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
