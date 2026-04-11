import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { urbisClient } from "../client.js";

export function registerGetLayerTool(server: McpServer): void {
  server.tool(
    "urbis_get_layer",
    "Get metadata for a specific public URBIS WMS layer.",
    {
      service: z.enum(["vector", "raster"]).describe("Which public URBIS WMS service to inspect"),
      layerName: z.string().describe("Exact WMS layer name"),
    },
    async ({ service, layerName }) => {
      try {
        return jsonResult(await urbisClient.getLayer(service, layerName));
      } catch (e) {
        return errorResult(`Layer metadata fetch failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
