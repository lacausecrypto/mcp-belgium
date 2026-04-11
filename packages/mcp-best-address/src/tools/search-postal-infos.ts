import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { bestAddressClient } from "../client.js";

export function registerSearchPostalInfosTool(server: McpServer): void {
  server.tool(
    "best_search_postal_infos",
    "Search Belgian postal information records in the official BeST address registry.",
    {
      name: z.string().optional().describe("Postal locality name"),
      postCode: z.string().optional().describe("Belgian postal code"),
      limit: z.number().min(1).max(50).default(10).describe("Maximum number of postal info records to return"),
      page: z.number().min(1).default(1).describe("Result page number"),
    },
    async (params) => {
      try {
        return jsonResult(await bestAddressClient.searchPostalInfos(params));
      } catch (e) {
        return errorResult(`Postal info search failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
