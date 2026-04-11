import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { brusselsClient } from "../client.js";

export function registerSearchDatasetsTool(server: McpServer): void {
  server.tool(
    "brussels_search_datasets",
    "Search Brussels Region open datasets.",
    {
      query: z.string().describe("Search query"),
      rows: z.number().min(1).max(50).default(10).describe("Maximum number of datasets to return"),
    },
    async ({ query, rows }) => {
      try {
        return jsonResult(await brusselsClient.searchDatasets(query, rows));
      } catch (e) {
        return errorResult(`Dataset search failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
