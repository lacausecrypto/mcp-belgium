import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { stibClient } from "../client.js";

export function registerGetWaitingTimesTool(server: McpServer): void {
  server.tool(
    "stib_get_waiting_times",
    "Get real-time waiting times at a STIB stop.",
    {
      stopName: z.string().describe("Stop name or stop ID"),
    },
    async ({ stopName }) => {
      try {
        return jsonResult(await stibClient.getWaitingTimes(stopName));
      } catch (e) {
        return errorResult(`Waiting times fetch failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
