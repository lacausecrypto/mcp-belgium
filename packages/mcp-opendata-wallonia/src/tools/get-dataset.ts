import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { walloniaClient } from "../client.js";

export function registerGetDatasetTool(server: McpServer): void {
  server.tool(
    "wallonia_get_dataset",
    "Get metadata for a Walloon open dataset.",
    {
      datasetId: z.string().describe("Dataset identifier"),
    },
    async ({ datasetId }) => {
      try {
        return jsonResult(await walloniaClient.getDataset(datasetId));
      } catch (e) {
        return errorResult(`Dataset lookup failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
