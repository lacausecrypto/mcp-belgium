import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { irailClient } from "../client.js";

export function registerGetLiveboardTool(server: McpServer): void {
  server.tool(
    "irail_get_liveboard",
    "Get real-time departures (or arrivals) at a Belgian railway station. Shows train number, destination, platform, and delay.",
    {
      station: z.string().describe("Station name"),
      arrivals: z.boolean().optional().describe("If true, show arrivals instead of departures"),
    },
    async ({ station, arrivals }) => {
      try {
        return jsonResult(await irailClient.getLiveboard(station, arrivals));
      } catch (e) {
        return errorResult(`Liveboard fetch failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
