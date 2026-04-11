import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { irailClient } from "../client.js";

export function registerSearchStationsTool(server: McpServer): void {
  server.tool(
    "irail_search_stations",
    "Search Belgian railway stations by name. Returns station ID, name, and coordinates.",
    { query: z.string().describe("Station name or partial name") },
    async ({ query }) => {
      try {
        return jsonResult(await irailClient.searchStations(query));
      } catch (e) {
        return errorResult(`Station search failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
