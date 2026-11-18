import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { statbelClient } from "../client.js";

export function registerGetViewTool(server: McpServer): void {
  server.tool(
    "statbel_get_view",
    "Get the data rows (facts) of a Statbel view found with statbel_search_datasets.",
    {
      viewId: z.string().min(1).describe("View id from statbel_search_datasets"),
      limit: z.number().int().min(1).max(1000).default(200).describe("Maximum number of rows to return"),
    },
    async ({ viewId, limit }) => {
      try {
        return jsonResult(await statbelClient.getView(viewId, limit));
      } catch (e) {
        return errorResult(`View lookup failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
