import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { errorResult, jsonResult } from "@lacausecrypto/core";
import { mobilityClient } from "../client.js";

export function registerPlanTripTool(server: McpServer): void {
  server.tool(
    "mobility_plan_trip",
    "Plan an intermodal trip across Belgian public transport operators.",
    {
      from: z.string().describe("Trip origin"),
      to: z.string().describe("Trip destination"),
      datetime: z.string().optional().describe("ISO datetime, e.g. 2026-04-11T14:30"),
    },
    async ({ from, to, datetime }) => {
      try {
        return jsonResult(await mobilityClient.planTrip(from, to, datetime));
      } catch (e) {
        return errorResult(`Trip planning failed: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  );
}
