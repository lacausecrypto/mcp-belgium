import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { kboClient } from "../client.js";

export function registerSearchEnterpriseTool(server: McpServer): void {
  server.tool(
    "kbo_search_enterprise",
    "Search Belgian enterprises by enterprise name or BCE number.",
    {
      query: z.string().describe("Enterprise name or BCE number"),
      type: z.enum(["name", "number"]).optional().describe("Search by enterprise name or BCE number"),
    },
    async ({ query, type }) => {
      try {
        return jsonResult(await kboClient.searchEnterprise(query, type));
      } catch (e) {
        return errorResult(`Enterprise search failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
