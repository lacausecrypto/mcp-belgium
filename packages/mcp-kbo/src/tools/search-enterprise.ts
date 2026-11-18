import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { kboClient } from "../client.js";

export function registerSearchEnterpriseTool(server: McpServer): void {
  server.tool(
    "kbo_search_enterprise",
    "Search Belgian enterprises by name or BCE number, optionally restricted to a postal code. Requires CBEAPI_KEY.",
    {
      query: z.string().describe("Enterprise name or BCE number"),
      type: z.enum(["name", "number"]).optional().describe("Search by enterprise name or BCE number"),
      postCode: z.number().int().min(1000).max(9999).optional().describe("Belgian 4-digit postal code filter for name searches"),
    },
    async ({ query, type, postCode }) => {
      try {
        return jsonResult(await kboClient.searchEnterprise(query, type, postCode));
      } catch (e) {
        return errorResult(`Enterprise search failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
