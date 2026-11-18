import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { statbelClient } from "../client.js";

export function registerSearchDatasetsTool(server: McpServer): void {
  server.tool(
    "statbel_search_datasets",
    "Search Statbel (Be.STAT) statistical views by words in their title. Returns view ids for statbel_get_view. Titles are in the view's own language: search in English, French or Dutch.",
    {
      query: z.string().min(1).describe("Words that must all appear in the title, e.g. 'population region' or 'prix logement'"),
      language: z.enum(["en", "fr", "nl", "de"]).optional().describe("Only return views published in this language"),
      limit: z.number().int().min(1).max(100).default(20).describe("Maximum number of views to return"),
    },
    async ({ query, language, limit }) => {
      try {
        return jsonResult(await statbelClient.searchDatasets(query, language, limit));
      } catch (e) {
        return errorResult(`Dataset search failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
