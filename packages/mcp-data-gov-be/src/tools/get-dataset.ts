import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { dataGovBeClient } from "../client.js";

export function registerGetDatasetTool(server: McpServer): void {
  server.tool(
    "datagov_get_dataset",
    "Get full metadata and resource listings for a Belgian federal open dataset.",
    {
      datasetId: z.string().describe("CKAN dataset ID or name"),
    },
    async ({ datasetId }) => {
      try {
        return jsonResult(await dataGovBeClient.getDataset(datasetId));
      } catch (e) {
        return errorResult(`Dataset lookup failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
