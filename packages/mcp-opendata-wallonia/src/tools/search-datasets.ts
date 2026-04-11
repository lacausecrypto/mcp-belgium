import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { walloniaClient } from "../client.js";

export function registerSearchDatasetsTool(server: McpServer): void {
  server.tool(
    "wallonia_search_datasets",
    "Search Walloon open datasets.",
    {
      query: z.string().describe("Search query"),
      rows: z.number().min(1).max(50).default(10).describe("Maximum number of datasets to return"),
    },
    async ({ query, rows }) => {
      try {
        return jsonResult(await walloniaClient.searchDatasets(query, rows));
      } catch (e) {
        return errorResult(`Dataset search failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
