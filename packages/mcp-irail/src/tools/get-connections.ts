import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@belgium-gov-mcp/core";
import { irailClient } from "../client.js";

export function registerGetConnectionsTool(server: McpServer): void {
  server.tool(
    "irail_get_connections",
    "Find train connections between two Belgian railway stations. Returns routes with departure/arrival times, platforms, delays, and transfers.",
    {
      from: z.string().describe("Departure station name"),
      to: z.string().describe("Arrival station name"),
      datetime: z.string().optional().describe("ISO datetime, e.g. 2026-04-11T14:30"),
      timeSel: z.enum(["departure", "arrival"]).optional().describe("Search by departure or arrival time"),
    },
    async ({ from, to, datetime, timeSel }) => {
      try {
        return jsonResult(await irailClient.getConnections(from, to, datetime, timeSel));
      } catch (e) {
        return errorResult(`Connection search failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
