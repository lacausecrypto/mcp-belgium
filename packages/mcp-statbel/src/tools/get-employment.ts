import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { statbelClient } from "../client.js";

export function registerGetEmploymentTool(server: McpServer): void {
  server.tool(
    "statbel_get_employment",
    "Get yearly employment, unemployment and activity rates (ages 15-64) by gender for Belgium and its regions (Statbel Labour Force Survey).",
    {
      year: z.number().int().optional().describe("Year"),
      region: z.string().optional().describe("Belgium, Brussels, Flanders or Wallonia (FR/NL names accepted)"),
    },
    async ({ year, region }) => {
      try {
        return jsonResult(await statbelClient.getEmployment(year, region));
      } catch (e) {
        return errorResult(`Employment lookup failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
