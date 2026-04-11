import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { kboClient } from "../client.js";

export function registerSearchByActivityTool(server: McpServer): void {
  server.tool(
    "kbo_search_by_activity",
    "Search Belgian enterprises by NACE activity code.",
    {
      naceCode: z.string().describe("NACE code, e.g. 62.010"),
    },
    async ({ naceCode }) => {
      try {
        return jsonResult(await kboClient.searchByActivity(naceCode));
      } catch (e) {
        return errorResult(`Activity search failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
