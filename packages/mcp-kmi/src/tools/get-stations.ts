import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { kmiClient } from "../client.js";

export function registerGetStationsTool(server: McpServer): void {
  server.tool(
    "kmi_get_stations",
    "Get KMI/IRM automatic weather station features from the official WFS endpoint.",
    {
      count: z.number().min(1).max(500).default(10).describe("Maximum number of stations to return"),
    },
    async ({ count }) => {
      try {
        return jsonResult(await kmiClient.getStations(count));
      } catch (e) {
        return errorResult(`Station fetch failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
