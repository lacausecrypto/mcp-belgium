import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { dataGovBeClient } from "../client.js";

export function registerSearchDatasetsTool(server: McpServer): void {
  server.tool(
    "datagov_search_datasets",
    "Search Belgian federal open datasets published on data.gov.be.",
    {
      query: z.string().describe("Search query"),
      tags: z.string().optional().describe("Comma-separated tags"),
      organization: z.string().optional().describe("Publishing organization name or identifier"),
      rows: z.number().min(1).max(50).default(10).describe("Maximum number of datasets to return"),
    },
    async ({ query, tags, organization, rows }) => {
      try {
        return jsonResult(await dataGovBeClient.searchDatasets(query, tags, organization, rows));
      } catch (e) {
        return errorResult(`Dataset search failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
