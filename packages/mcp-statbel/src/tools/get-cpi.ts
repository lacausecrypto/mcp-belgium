import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { statbelClient } from "../client.js";

export function registerGetCpiTool(server: McpServer): void {
  server.tool(
    "statbel_get_cpi",
    "Get Belgian consumer price index data from Statbel.",
    {
      year: z.number().optional().describe("Year"),
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
