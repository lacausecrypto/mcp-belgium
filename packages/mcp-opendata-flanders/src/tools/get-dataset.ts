import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { flandersClient } from "../client.js";

export function registerGetDatasetTool(server: McpServer): void {
  server.tool(
    "flanders_get_dataset",
    "Get full metadata for a Flemish open dataset.",
    {
      datasetId: z.string().describe("CKAN dataset ID or name"),
    },
    async ({ datasetId }) => {
      try {
        return jsonResult(await flandersClient.getDataset(datasetId));
      } catch (e) {
        return errorResult(`Dataset lookup failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
