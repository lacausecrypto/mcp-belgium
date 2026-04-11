import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { stibClient } from "../client.js";

export function registerSearchStopsTool(server: McpServer): void {
  server.tool(
    "stib_search_stops",
    "Search STIB stops by name.",
    {
      query: z.string().describe("Stop name query"),
    },
    async ({ query }) => {
      try {
        return jsonResult(await stibClient.searchStops(query));
      } catch (e) {
        return errorResult(`Stop search failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
