import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { dataGovBeClient } from "../client.js";
import { languageSchema } from "./language.js";

export function registerSearchDatasetsTool(server: McpServer): void {
  server.tool(
    "datagov_search_datasets",
    "Search the data.gov.be open data catalogue (federal, regional and local Belgian publishers), via its official mirror on data.europa.eu. Returns dataset ids usable with datagov_get_dataset.",
    {
      query: z.string().describe("Full-text search query, e.g. 'population', 'budget'"),
      tags: z.string().optional().describe("Comma-separated keywords that must all be present, e.g. 'mobility,brussels'"),
      organization: z
        .string()
        .optional()
        .describe("Exact publisher name as returned by datagov_list_organizations, e.g. 'IWEPS'"),
      rows: z.number().int().min(1).max(50).default(10).describe("Maximum number of datasets to return"),
      language: languageSchema,
    },
    async ({ query, tags, organization, rows, language }) => {
      try {
        return jsonResult(await dataGovBeClient.searchDatasets(query, tags, organization, rows, language));
      } catch (e) {
        return errorResult(`Dataset search failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
