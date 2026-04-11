import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { statbelClient } from "../client.js";

export function registerGetPopulationTool(server: McpServer): void {
  server.tool(
    "statbel_get_population",
    "Get Belgian population statistics from Statbel.",
    {
      year: z.number().optional().describe("Year"),
      region: z.string().optional().describe("Belgium, Brussels, Flanders, Wallonia"),
    },
    async ({ year, region }) => {
      try {
        return jsonResult(await statbelClient.getPopulation(year, region));
      } catch (e) {
        return errorResult(`Population lookup failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
