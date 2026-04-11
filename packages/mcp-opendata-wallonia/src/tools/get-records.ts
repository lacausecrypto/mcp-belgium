import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { walloniaClient } from "../client.js";

export function registerGetRecordsTool(server: McpServer): void {
  server.tool(
    "wallonia_get_records",
    "Get records from a Walloon open dataset.",
    {
      datasetId: z.string().describe("Dataset identifier"),
      where: z.string().optional().describe("Optional OpenDataSoft where clause"),
      limit: z.number().min(1).max(100).default(20).describe("Maximum number of records to return"),
    },
    async ({ datasetId, where, limit }) => {
      try {
        return jsonResult(await walloniaClient.getRecords(datasetId, where, limit));
      } catch (e) {
        return errorResult(`Record fetch failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
