import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { infrabelClient } from "../client.js";

export function registerGetDatasetTool(server: McpServer): void {
  server.tool(
    "infrabel_get_dataset",
    "Get full metadata for an Infrabel open dataset.",
    {
      datasetId: z.string().describe("OpenDataSoft dataset identifier"),
    },
    async ({ datasetId }) => {
      try {
        return jsonResult(await infrabelClient.getDataset(datasetId));
      } catch (e) {
        return errorResult(`Dataset fetch failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
