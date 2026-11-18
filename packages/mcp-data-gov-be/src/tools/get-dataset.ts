import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { dataGovBeClient } from "../client.js";
import { languageSchema } from "./language.js";

export function registerGetDatasetTool(server: McpServer): void {
  server.tool(
    "datagov_get_dataset",
    "Get full metadata and downloadable resources (format, license, access/download URLs) for a data.gov.be dataset.",
    {
      datasetId: z.string().min(1).describe("Dataset id as returned by datagov_search_datasets"),
      language: languageSchema,
    },
    async ({ datasetId, language }) => {
      try {
        return jsonResult(await dataGovBeClient.getDataset(datasetId, language));
      } catch (e) {
        return errorResult(`Dataset lookup failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
