import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { kboClient } from "../client.js";

export function registerSearchByActivityTool(server: McpServer): void {
  server.tool(
    "kbo_search_by_activity",
    "List Belgian enterprises registered under a NACE activity code (sub-codes included, paginated). Requires CBEAPI_KEY.",
    {
      naceCode: z.string().describe("NACE code, dots optional, e.g. 62, 62.01 or 62.010"),
      naceVersion: z
        .enum(["2003", "2008", "2025"])
        .default("2008")
        .describe("NACE nomenclature version; the same code can mean different activities across versions"),
      page: z.number().int().min(1).default(1).describe("Result page (1-based)"),
    },
    async ({ naceCode, naceVersion, page }) => {
      try {
        return jsonResult(await kboClient.searchByActivity(naceCode, naceVersion, page));
      } catch (e) {
        return errorResult(`Activity search failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
