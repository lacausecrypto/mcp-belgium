import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { urbanBrusselsClient } from "../client.js";

export function registerGetMunicipalitiesBoundariesTool(server: McpServer): void {
  server.tool(
    "urban_get_municipalities_boundaries",
    "Fetch Brussels municipality boundaries from the urban.brussels public WFS endpoint.",
    {
      count: z.number().min(1).max(500).default(10).describe("Maximum number of municipality features to return"),
    },
    async ({ count }) => {
      try {
        return jsonResult(await urbanBrusselsClient.getMunicipalitiesBoundaries(count));
      } catch (e) {
        return errorResult(`Municipality boundary fetch failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
