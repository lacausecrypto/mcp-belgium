import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { statbelClient } from "../client.js";

export function registerSearchDatasetsTool(server: McpServer): void {
  server.tool(
    "statbel_search_datasets",
    "Search Statbel open data datasets.",
    {
      query: z.string().describe("Search query"),
    },
    async ({ query }) => {
      try {
        return jsonResult(await statbelClient.searchDatasets(query));
      } catch (e) {
        return errorResult(`Dataset search failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
