import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { statbelClient } from "../client.js";

export function registerGetCpiTool(server: McpServer): void {
  server.tool(
    "statbel_get_cpi",
    "Get the Belgian consumer price index for the last 13 months, global and by main component (Statbel).",
    {
      year: z.number().int().optional().describe("Keep only months of this year"),
    },
    async ({ year }) => {
      try {
        return jsonResult(await statbelClient.getCpi(year));
      } catch (e) {
        return errorResult(`CPI lookup failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
