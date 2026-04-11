import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { statbelClient } from "../client.js";

export function registerGetEmploymentTool(server: McpServer): void {
  server.tool(
    "statbel_get_employment",
    "Get Belgian employment statistics from Statbel.",
    {
      year: z.number().optional().describe("Year"),
    },
    async ({ year }) => {
      try {
        return jsonResult(await statbelClient.getEmployment(year));
      } catch (e) {
        return errorResult(`Employment lookup failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
