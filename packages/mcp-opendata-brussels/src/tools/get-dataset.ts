import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { brusselsClient } from "../client.js";

export function registerGetDatasetTool(server: McpServer): void {
  server.tool(
    "brussels_get_dataset",
    "Get metadata for a Brussels Region open dataset.",
    {
      datasetId: z.string().describe("Dataset identifier"),
    },
    async ({ datasetId }) => {
      try {
        return jsonResult(await brusselsClient.getDataset(datasetId));
      } catch (e) {
        return errorResult(`Dataset lookup failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
