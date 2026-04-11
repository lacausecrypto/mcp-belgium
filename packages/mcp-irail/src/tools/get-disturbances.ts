import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { irailClient } from "../client.js";

export function registerGetDisturbancesTool(server: McpServer): void {
  server.tool(
    "irail_get_disturbances",
    "Get current Belgian railway disruptions, delays, and planned maintenance.",
    {},
    async () => {
      try {
        return jsonResult(await irailClient.getDisturbances());
      } catch (e) {
        return errorResult(`Disturbances fetch failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
