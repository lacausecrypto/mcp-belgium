import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { flandersClient } from "../client.js";

export function registerSearchDatasetsTool(server: McpServer): void {
  server.tool(
    "flanders_search_datasets",
    "Search Flemish open datasets published on the CKAN platform.",
    {
      query: z.string().describe("Search query"),
      tags: z.string().optional().describe("Comma-separated tags"),
      organization: z.string().optional().describe("Publishing organization name or identifier"),
      rows: z.number().min(1).max(50).default(10).describe("Maximum number of datasets to return"),
    },
    async ({ query, tags, organization, rows }) => {
      try {
        return jsonResult(await flandersClient.searchDatasets(query, tags, organization, rows));
      } catch (e) {
        return errorResult(`Dataset search failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
