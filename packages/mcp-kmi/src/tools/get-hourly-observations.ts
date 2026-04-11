import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { kmiClient } from "../client.js";

export function registerGetHourlyObservationsTool(server: McpServer): void {
  server.tool(
    "kmi_get_hourly_observations",
    "Get hourly weather observation features from the KMI/IRM WFS endpoint.",
    {
      count: z.number().min(1).max(500).default(10).describe("Maximum number of observations to return"),
      stationCode: z.number().optional().describe("Optional numeric station code to filter observations"),
    },
    async ({ count, stationCode }) => {
      try {
        return jsonResult(await kmiClient.getHourlyObservations(count, stationCode));
      } catch (e) {
        return errorResult(`Hourly observation fetch failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
