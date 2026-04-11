import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { infrabelClient } from "../client.js";

export function registerGetRecordsTool(server: McpServer): void {
  server.tool(
    "infrabel_get_records",
    "Get records from an Infrabel dataset using the public ODS records endpoint.",
    {
      datasetId: z.string().describe("OpenDataSoft dataset identifier"),
      where: z.string().optional().describe("Optional ODS where clause"),
      limit: z.number().min(1).max(100).default(20).describe("Maximum number of records to return"),
    },
    async ({ datasetId, where, limit }) => {
      try {
        return jsonResult(await infrabelClient.getRecords(datasetId, where, limit));
      } catch (e) {
        return errorResult(`Record fetch failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
