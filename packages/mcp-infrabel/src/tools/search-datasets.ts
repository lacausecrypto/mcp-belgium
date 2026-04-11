import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { infrabelClient } from "../client.js";

export function registerSearchDatasetsTool(server: McpServer): void {
  server.tool(
    "infrabel_search_datasets",
    "Search Infrabel open datasets published on the public OpenDataSoft portal.",
    {
      query: z.string().describe("Search query"),
      rows: z.number().min(1).max(50).default(10).describe("Maximum number of datasets to return"),
    },
    async ({ query, rows }) => {
      try {
        return jsonResult(await infrabelClient.searchDatasets(query, rows));
      } catch (e) {
        return errorResult(`Dataset search failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
