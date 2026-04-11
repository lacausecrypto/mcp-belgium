import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { bestAddressClient } from "../client.js";

export function registerSearchStreetsTool(server: McpServer): void {
  server.tool(
    "best_search_streets",
    "Search Belgian street records in the official BeST address registry.",
    {
      name: z.string().optional().describe("Street name"),
      municipalityId: z.string().optional().describe("Municipality identifier URI"),
      municipalityName: z.string().optional().describe("Municipality name"),
      nisCode: z.string().optional().describe("Municipality NIS code"),
      postCode: z.string().optional().describe("Belgian postal code"),
      limit: z.number().min(1).max(50).default(10).describe("Maximum number of streets to return"),
      page: z.number().min(1).default(1).describe("Result page number"),
    },
    async (params) => {
      try {
        return jsonResult(await bestAddressClient.searchStreets(params));
      } catch (e) {
        return errorResult(`Street search failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
