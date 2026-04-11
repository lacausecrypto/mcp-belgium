import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { bestAddressClient } from "../client.js";

export function registerSearchMunicipalitiesTool(server: McpServer): void {
  server.tool(
    "best_search_municipalities",
    "Search Belgian municipalities in the official BeST address registry.",
    {
      name: z.string().optional().describe("Municipality name"),
      nisCode: z.string().optional().describe("Municipality NIS code"),
      postCode: z.string().optional().describe("Belgian postal code"),
      limit: z.number().min(1).max(50).default(10).describe("Maximum number of municipalities to return"),
      page: z.number().min(1).default(1).describe("Result page number"),
    },
    async (params) => {
      try {
        return jsonResult(await bestAddressClient.searchMunicipalities(params));
      } catch (e) {
        return errorResult(`Municipality search failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
