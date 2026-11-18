import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { statbelClient } from "../client.js";

export function registerGetPopulationTool(server: McpServer): void {
  server.tool(
    "statbel_get_population",
    "Get official population on January 1st for Belgium and its three regions (Statbel, last ~10 years).",
    {
      year: z.number().int().optional().describe("Reference year (population on January 1st)"),
      region: z.string().optional().describe("Belgium, Brussels, Flanders or Wallonia (FR/NL names accepted)"),
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
