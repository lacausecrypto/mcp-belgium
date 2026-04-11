import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { urbisClient } from "../client.js";

export function registerListLayersTool(server: McpServer): void {
  server.tool(
    "urbis_list_layers",
    "List public URBIS WMS layers for the vector or raster service.",
    {
      service: z.enum(["vector", "raster"]).describe("Which public URBIS WMS service to inspect"),
      query: z.string().optional().describe("Optional text filter on layer name or title"),
      limit: z.number().min(1).max(100).default(25).describe("Maximum number of layers to return"),
    },
    async ({ service, query, limit }) => {
      try {
        return jsonResult(await urbisClient.listLayers(service, query, limit));
      } catch (e) {
        return errorResult(`Layer listing failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
